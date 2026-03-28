const API_BASE = "http://127.0.0.1:5000/api";

let selectedRoom = null;

const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");

const roomNameInput = document.getElementById("roomName");
const roomPriceInput = document.getElementById("roomPrice");
const roomCapacityInput = document.getElementById("roomCapacity");
const checkInInput = document.getElementById("checkIn");
const checkOutInput = document.getElementById("checkOut");
const guestsInput = document.getElementById("guests");
const paymentMethodInput = document.getElementById("paymentMethod");
const totalNightsText = document.getElementById("totalNights");
const estimatedTotalText = document.getElementById("estimatedTotal");

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  setupLogout();
  await loadSelectedRoom();
  setupDateValidation();
  setupSummaryListeners();
  setupBookingForm(user);
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

async function loadSelectedRoom() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("room_id");

  if (!roomId) {
    showMessage("Please select a room first.", "error");
    setTimeout(() => {
      window.location.href = "rooms.html";
    }, 1000);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/rooms/${roomId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load selected room.");
    }

    selectedRoom = data.room;

    roomNameInput.textContent = selectedRoom.room_name || "-";
    roomPriceInput.textContent = `₱${Number(selectedRoom.price || 0).toLocaleString()}`;
    roomCapacityInput.textContent = selectedRoom.capacity || 0;
    guestsInput.max = selectedRoom.capacity || 1;

    updateBookingSummary();
  } catch (error) {
    console.error("loadSelectedRoom error:", error);
    showMessage(error.message || "Failed to load selected room.", "error");
  }
}

function formatDateForInput(date) {
  return date.toISOString().split("T")[0];
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDateForInput(date);
}

function setupDateValidation() {
  const today = new Date();
  const todayString = formatDateForInput(today);

  checkInInput.min = todayString;

  if (!checkInInput.value) {
    checkInInput.value = todayString;
  }

  updateCheckOutRules();

  checkInInput.addEventListener("input", updateCheckOutRules);
  checkOutInput.addEventListener("input", updateBookingSummary);
}

function updateCheckOutRules() {
  if (!checkInInput.value) return;

  const minimumCheckOut = addDays(checkInInput.value, 1);
  checkOutInput.min = minimumCheckOut;

  if (!checkOutInput.value || checkOutInput.value <= checkInInput.value) {
    checkOutInput.value = minimumCheckOut;
  }

  updateBookingSummary();
}

function setupSummaryListeners() {
  guestsInput.addEventListener("input", () => {
    if (!selectedRoom) return;

    const maxCapacity = Number(selectedRoom.capacity || 0);

    if (Number(guestsInput.value) > maxCapacity) {
      guestsInput.value = maxCapacity;
      showMessage(`Maximum guests allowed for this room is ${maxCapacity}.`, "error");
    } else {
      bookingMessage.textContent = "";
    }

    updateBookingSummary();
  });

  paymentMethodInput.addEventListener("change", updateBookingSummary);
}

function updateBookingSummary() {
  if (!selectedRoom) {
    totalNightsText.textContent = "0";
    estimatedTotalText.textContent = "₱0";
    return;
  }

  const checkIn = checkInInput.value;
  const checkOut = checkOutInput.value;
  const price = Number(selectedRoom.price || 0);

  if (!checkIn || !checkOut) {
    totalNightsText.textContent = "0";
    estimatedTotalText.textContent = "₱0";
    return;
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  const timeDifference = endDate - startDate;
  const nights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    totalNightsText.textContent = "0";
    estimatedTotalText.textContent = "₱0";
    return;
  }

  const total = nights * price;

  totalNightsText.textContent = nights;
  estimatedTotalText.textContent = `₱${total.toLocaleString()}`;
}

function setupBookingForm(user) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedRoom) {
      showMessage("Selected room is not loaded yet.", "error");
      return;
    }

    const check_in = checkInInput.value;
    const check_out = checkOutInput.value;
    const guests = Number(guestsInput.value);
    const payment_method = paymentMethodInput.value;
    const maxCapacity = Number(selectedRoom.capacity || 0);

    const today = formatDateForInput(new Date());
    const minimumCheckOut = addDays(check_in, 1);

    if (!check_in || !check_out || !guests || !payment_method) {
      showMessage("Please fill in all fields.", "error");
      return;
    }

    if (check_in < today) {
      showMessage("Check-in date cannot be in the past.", "error");
      return;
    }

    if (check_out < minimumCheckOut) {
      showMessage("Check-out date must be at least one day after check-in.", "error");
      return;
    }

    if (guests > maxCapacity) {
      showMessage(`This room can only accommodate up to ${maxCapacity} guests.`, "error");
      return;
    }

    const bookingData = {
      user_id: user.id,
      room_id: selectedRoom.id,
      check_in,
      check_out,
      guests,
      payment_method,
      payment_status: payment_method === "paypal" ? "pending" : "unpaid",
    };

    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.bookingId) {
          window.location.href = `booking-receipt.html?id=${data.bookingId}`;
        } else {
          window.location.href = "my-bookings.html";
        }
      } else {
        showMessage(data.message || "Booking failed.", "error");
      }
    } catch (error) {
      console.error("booking submit error:", error);
      showMessage("Something went wrong. Please try again.", "error");
    }
  });
}

function showMessage(message, type = "success") {
  bookingMessage.textContent = message;
  bookingMessage.style.color = type === "error" ? "red" : "green";

  if (typeof showToast === "function") {
    showToast(message, type);
  }
}