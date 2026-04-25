const API_BASE = "http://127.0.0.1:5000/api";
const BOOKING_DRAFT_KEY = "smartresort_booking_draft_v2";

let bookingDraft = null;
let availableAccommodations = [];

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  setupLogout();
  await loadAccommodations();
  loadDraft();
  renderDraftSummary();
  setupPaymentForm();
  updateQrPlaceholder();
});

function setupLogout() {
  const logoutBtns = [
    document.getElementById("logoutBtn"),
    document.getElementById("mobileLogoutBtn"),
  ].filter(Boolean);

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("user");

      if (typeof showToast === "function") {
        showToast("Logged out successfully.", "success");
      } else {
        alert("Logged out successfully.");
      }

      setTimeout(() => {
        window.location.href = "login.html";
      }, 700);
    });
  });
}

async function loadAccommodations() {
  try {
    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load accommodations.");
    }

    availableAccommodations = Array.isArray(data) ? data : data.rooms || [];
  } catch (error) {
    console.error("loadAccommodations error:", error);
    showMessage(error.message || "Failed to load accommodations.", "error");
  }
}

function loadDraft() {
  const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);

  if (!raw) {
    alert("No reservation draft found. Please fill up the reservation form first.");
    window.location.href = "booking.html";
    return;
  }

  try {
    bookingDraft = JSON.parse(raw);
  } catch (error) {
    console.error("loadDraft error:", error);
    alert("Reservation draft is invalid. Please start again.");
    window.location.href = "booking.html";
  }
}

function getAccommodationById(id) {
  return availableAccommodations.find((item) => Number(item.id) === Number(id)) || null;
}

function getSlotOptions(accommodation) {
  if (!accommodation) return [];

  const category = String(accommodation.category_name || "").toLowerCase();
  const isRoom = category === "room";

  return [
    {
      value: "day_tour",
      label: "Day Tour",
      price: Number(accommodation.day_price || 0),
      start: accommodation.day_start_time,
      end: accommodation.day_end_time,
    },
    {
      value: "overnight",
      label: "Overnight",
      price: Number(accommodation.overnight_price || 0),
      start: accommodation.overnight_start_time,
      end: accommodation.overnight_end_time,
    },
    {
      value: "extended",
      label: isRoom ? "22 Hours" : "23 Hours",
      price: Number(accommodation.extended_price || 0),
      start: accommodation.extended_start_time,
      end: accommodation.extended_end_time,
    },
  ];
}

function getTotalFreeEntrancePax(items, guestCount) {
  let total = 0;

  items.forEach((item) => {
    const accommodation = getAccommodationById(item.accommodation_id);
    if (!accommodation) return;

    total += Number(accommodation.free_entrance_pax || 0);
  });

  return Math.min(total, Number(guestCount || 0));
}

function renderDraftSummary() {
  if (!bookingDraft) return;

  const summaryList = document.getElementById("reservationSummaryList");
  if (!summaryList) return;

  const items = Array.isArray(bookingDraft.items) ? bookingDraft.items : [];
  let accommodationTotal = 0;

  summaryList.innerHTML = items
    .map((item, index) => {
      const accommodation = getAccommodationById(item.accommodation_id);
      if (!accommodation) {
        return `
          <div class="summary-item">
            <strong>Accommodation Item ${index + 1}</strong><br />
            Selected accommodation is unavailable or missing.
          </div>
        `;
      }

      const slot = getSlotOptions(accommodation).find((s) => s.value === item.slot_type);
      const slotPrice = Number(slot?.price || 0);
      accommodationTotal += slotPrice;

      const checkOutDate = calculateCheckOutDate(
        item.check_in_date,
        slot?.start,
        slot?.end
      );

      return `
        <div class="summary-item">
          <strong>${escapeHtml(accommodation.name)}</strong><br />
          Category: ${escapeHtml(accommodation.category_name)}<br />
          Slot: ${escapeHtml(slot?.label || "-")} (${formatTimeDisplay(slot?.start)} - ${formatTimeDisplay(slot?.end)})<br />
          Reservation Date: ${formatDateDisplay(item.check_in_date)}<br />
          Check-out Date: ${formatDateDisplay(checkOutDate)}<br />
          Max Capacity: ${accommodation.max_capacity || 0} guest(s)<br />
          Free Entrance Included: ${Number(accommodation.free_entrance_pax || 0)} pax<br />
          Price: ₱${formatMoney(slotPrice)}
        </div>
      `;
    })
    .join("");

  const entranceFee = getEstimatedEntranceFee();
  const downpayment = accommodationTotal * 0.5;
  const remaining = accommodationTotal - downpayment;

  document.getElementById("paymentAccommodationTotal").textContent = `₱${formatMoney(accommodationTotal)}`;
  document.getElementById("paymentDownpayment").textContent = `₱${formatMoney(downpayment)}`;
  document.getElementById("paymentRemaining").textContent = `₱${formatMoney(remaining)}`;
  document.getElementById("paymentEntranceFee").textContent = `₱${formatMoney(entranceFee)}`;
  document.getElementById("paymentFrontDeskReminder").textContent = `₱${formatMoney(remaining + entranceFee)}`;
}

function getEstimatedEntranceFee() {
  if (!bookingDraft) return 0;

  const guestCount = Number(bookingDraft.guest_count || 0);
  const entranceType = bookingDraft.entrance_type || "pool_beach";
  const items = Array.isArray(bookingDraft.items) ? bookingDraft.items : [];

  const hasOvernightStyle = items.some((item) =>
    item.slot_type === "overnight" || item.slot_type === "extended"
  );

  const totalFreeEntrancePax = getTotalFreeEntrancePax(items, guestCount);
  const chargeableGuests = Math.max(guestCount - totalFreeEntrancePax, 0);

  const rate =
    entranceType === "beach_only"
      ? hasOvernightStyle
        ? 200
        : 150
      : hasOvernightStyle
        ? 300
        : 250;

  return chargeableGuests * rate;
}

function setupPaymentForm() {
  const paymentMethod = document.getElementById("paymentMethod");
  const proofImage = document.getElementById("proofImage");
  const paymentForm = document.getElementById("paymentForm");

  if (paymentMethod) {
    paymentMethod.addEventListener("change", updateQrPlaceholder);
  }

  if (proofImage) {
    proofImage.addEventListener("change", previewProofImage);
  }

  if (paymentForm) {
    paymentForm.addEventListener("submit", submitReservation);
  }
}

function previewProofImage() {
  const input = document.getElementById("proofImage");
  const previewBox = document.getElementById("proofPreviewBox");
  const previewImage = document.getElementById("proofPreviewImage");

  if (!input || !previewBox || !previewImage) return;

  const file = input.files && input.files[0];
  if (!file) {
    previewBox.style.display = "none";
    previewImage.src = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    previewBox.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function updateQrPlaceholder() {
  const method = document.getElementById("paymentMethod")?.value || "gcash";
  const box = document.getElementById("qrPlaceholderBox");
  if (!box) return;

  box.innerHTML =
    method === "paymaya"
      ? `PayMaya selected.<br />Future QR code area can be shown here.<br />For now, upload your payment screenshot below.`
      : `GCash selected.<br />Future QR code area can be shown here.<br />For now, upload your payment screenshot below.`;
}

async function submitReservation(e) {
  e.preventDefault();

  if (!bookingDraft) {
    showMessage("Reservation draft is missing.", "error");
    return;
  }

  const payment_method = document.getElementById("paymentMethod").value;
  const paymentReference = document.getElementById("paymentReference").value.trim();
  const paymentReminderNote = document.getElementById("paymentReminderNote").value.trim();
  const proofImage = document.getElementById("proofImage").files[0];

  if (!paymentReference) {
    showMessage("Reference number is required.", "error");
    return;
  }

  if (!proofImage) {
    showMessage("Please upload your payment screenshot.", "error");
    return;
  }

  const payload = {
    ...bookingDraft,
    payment_method,
    proof_reference: paymentReference,
    note: [bookingDraft.note, paymentReminderNote].filter(Boolean).join(" | "),
  };

  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  formData.append("proof_image", proofImage);

  const submitBtn = document.querySelector('#paymentForm button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : "Submit Reservation";

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const response = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Reservation failed.");
    }

    sessionStorage.removeItem(BOOKING_DRAFT_KEY);

    if (data.bookingId) {
      window.location.href = `booking-receipt.html?id=${data.bookingId}`;
    } else {
      window.location.href = "my-bookings.html";
    }
  } catch (error) {
    console.error("submitReservation error:", error);
    showMessage(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

function calculateCheckOutDate(checkInDate, startTime, endTime) {
  if (!checkInDate || !startTime || !endTime) return checkInDate || "-";

  const startParts = String(startTime).split(":");
  const endParts = String(endTime).split(":");

  if (startParts.length < 2 || endParts.length < 2) return checkInDate;

  const startMinutes = Number(startParts[0]) * 60 + Number(startParts[1]);
  const endMinutes = Number(endParts[0]) * 60 + Number(endParts[1]);

  if (endMinutes <= startMinutes) {
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  }

  return checkInDate;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTimeDisplay(timeValue) {
  if (!timeValue) return "N/A";

  const timeText = String(timeValue).trim();
  const parts = timeText.split(":");

  if (parts.length < 2) return timeText;

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) return timeText;

  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${suffix}`;
}

function formatDateDisplay(dateValue) {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString();
}

function showMessage(message, type = "success") {
  const messageEl = document.getElementById("paymentMessage");
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.style.color = type === "error" ? "red" : "green";
  }

  if (typeof showToast === "function") {
    showToast(message, type);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}