const receiptBox = document.getElementById("receiptBox");
const logoutBtn = document.getElementById("logoutBtn");

const user = JSON.parse(localStorage.getItem("user"));
const API_BASE = "http://127.0.0.1:5000/api";

if (!user) {
  alert("Please login first.");
  window.location.href = "login.html";
}

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("user");
  localStorage.removeItem("selectedRoom");
  window.location.href = "login.html";
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTotalNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatPaymentMethod(method) {
  if (method === "paypal") return "PayPal";
  return "Cash on Arrival";
}

async function loadReceipt() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("id");

  if (!bookingId) {
    receiptBox.innerHTML = "<h2>Booking receipt not found.</h2>";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`);
    const booking = await response.json();

    if (!response.ok) {
      receiptBox.innerHTML = `<h2>${booking.message || "Failed to load receipt."}</h2>`;
      return;
    }

    if (Number(booking.user_id) !== Number(user.id) && user.role !== "admin") {
      receiptBox.innerHTML = "<h2>Access denied.</h2>";
      return;
    }

    const totalNights = getTotalNights(booking.check_in, booking.check_out);
    const estimatedTotal = totalNights * Number(booking.price || 0);

    receiptBox.innerHTML = `
      <div class="receipt-header">
        <h2>SmartResort Booking Receipt</h2>
        <p><strong>Booking ID:</strong> #${booking.id}</p>
      </div>

      <div class="receipt-grid">
        <p><strong>Guest Name:</strong> ${booking.fullname}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Room:</strong> ${booking.room_name}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${booking.status}">${booking.status}</span></p>
        <p><strong>Payment Method:</strong> ${formatPaymentMethod(booking.payment_method)}</p>
        <p><strong>Payment Status:</strong> ${booking.payment_status}</p>
        <p><strong>Check-in:</strong> ${formatDate(booking.check_in)}</p>
        <p><strong>Check-out:</strong> ${formatDate(booking.check_out)}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Booked On:</strong> ${formatDate(booking.created_at)}</p>
      </div>

      <div class="receipt-summary">
        <h3>Payment Summary</h3>
        <p><strong>Price per Night:</strong> ₱${Number(booking.price).toLocaleString()}</p>
        <p><strong>Total Nights:</strong> ${totalNights}</p>
        <p><strong>Estimated Total:</strong> ₱${estimatedTotal.toLocaleString()}</p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    receiptBox.innerHTML = "<h2>Something went wrong while loading the receipt.</h2>";
  }
}

loadReceipt();