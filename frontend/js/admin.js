const bookingsContainer = document.getElementById("bookingsContainer");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const statsContainer = document.getElementById("statsContainer");

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Please login first.");
  window.location.href = "login.html";
}

if (user && user.role !== "admin") {
  alert("Access denied. Admins only.");
  window.location.href = "index.html";
}

adminLogoutBtn.addEventListener("click", (e) => {
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

async function loadStats() {
  try {
    const response = await fetch("http://localhost:5000/api/bookings/stats/summary");
    const stats = await response.json();

    if (!response.ok) {
      statsContainer.innerHTML = "<p>Failed to load dashboard summary.</p>";
      return;
    }

    statsContainer.innerHTML = `
      <div class="stat-card">
        <h3>Total Rooms</h3>
        <p>${stats.total_rooms ?? 0}</p>
      </div>
      <div class="stat-card">
        <h3>Total Bookings</h3>
        <p>${stats.total_bookings ?? 0}</p>
      </div>
      <div class="stat-card">
        <h3>Pending</h3>
        <p>${stats.pending_bookings ?? 0}</p>
      </div>
      <div class="stat-card">
        <h3>Approved</h3>
        <p>${stats.approved_bookings ?? 0}</p>
      </div>
      <div class="stat-card">
        <h3>Cancelled</h3>
        <p>${stats.cancelled_bookings ?? 0}</p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    statsContainer.innerHTML = "<p>Something went wrong while loading summary cards.</p>";
  }
}

async function loadBookings() {
  try {
    const response = await fetch("http://localhost:5000/api/bookings");
    const bookings = await response.json();

    if (!response.ok) {
      bookingsContainer.innerHTML = "<p>Failed to load bookings.</p>";
      return;
    }

    if (bookings.length === 0) {
      bookingsContainer.innerHTML = "<p>No bookings found.</p>";
      return;
    }

    bookingsContainer.innerHTML = bookings
      .map(
        (booking) => `
          <div class="admin-card">
            <h3>${booking.room_name}</h3>
            <p><strong>Guest:</strong> ${booking.fullname}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Check-in:</strong> ${formatDate(booking.check_in)}</p>
            <p><strong>Check-out:</strong> ${formatDate(booking.check_out)}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Status:</strong> 
              <span class="status-badge status-${booking.status.toLowerCase()}">
                ${booking.status}
              </span>
            </p>

            <div class="admin-actions">
              <button class="btn-primary" onclick="updateStatus(${booking.id}, 'approved')">Approve</button>
              <button class="btn-secondary admin-reject" onclick="updateStatus(${booking.id}, 'rejected')">Reject</button>
              <button class="btn-secondary admin-pending" onclick="updateStatus(${booking.id}, 'pending')">Pending</button>
            </div>
          </div>
        `
      )
      .join("");
  } catch (error) {
    console.error(error);
    bookingsContainer.innerHTML = "<p>Something went wrong while loading bookings.</p>";
  }
}

async function updateStatus(id, status) {
  try {
    const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      loadBookings();
      loadStats();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Failed to update booking status.");
  }
}

loadStats();
loadBookings();