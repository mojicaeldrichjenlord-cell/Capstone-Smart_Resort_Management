const myBookingsContainer = document.getElementById("myBookingsContainer");
const logoutBtn = document.getElementById("logoutBtn");

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Please login first.");
  window.location.href = "login.html";
}

if (user && user.role === "admin") {
  window.location.href = "admin.html";
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

async function cancelBooking(bookingId) {
  const confirmed = confirm("Are you sure you want to cancel this booking?");
  if (!confirmed) return;

  try {
    const response = await fetch(`http://localhost:5000/api/bookings/cancel/${bookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: user.id }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      loadMyBookings();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Failed to cancel booking.");
  }
}

async function loadMyBookings() {
  try {
    const response = await fetch(`http://localhost:5000/api/bookings/user/${user.id}`);
    const bookings = await response.json();

    if (!response.ok) {
      myBookingsContainer.innerHTML = "<p>Failed to load your bookings.</p>";
      return;
    }

    if (bookings.length === 0) {
      myBookingsContainer.innerHTML = "<p>You have no bookings yet.</p>";
      return;
    }

    myBookingsContainer.innerHTML = bookings
      .map(
        (booking) => `
          <div class="admin-card">
            <h3>${booking.room_name}</h3>
            <p><strong>Check-in:</strong> ${formatDate(booking.check_in)}</p>
            <p><strong>Check-out:</strong> ${formatDate(booking.check_out)}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Status:</strong> 
              <span class="status-badge status-${booking.status.toLowerCase()}">
                ${booking.status}
              </span>
            </p>
            <p><strong>Booked on:</strong> ${formatDate(booking.created_at)}</p>

            ${
              booking.status.toLowerCase() === "pending"
                ? `<div class="admin-actions">
                    <button class="btn-secondary admin-reject" onclick="cancelBooking(${booking.id})">
                      Cancel Booking
                    </button>
                  </div>`
                : ""
            }
          </div>
        `
      )
      .join("");
  } catch (error) {
    console.error(error);
    myBookingsContainer.innerHTML = "<p>Something went wrong while loading your bookings.</p>";
  }
}

loadMyBookings();