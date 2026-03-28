const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  setupLogout();
  loadRooms();
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

async function loadRooms() {
  const container = document.getElementById("roomsContainer");

  try {
    container.innerHTML = `<p>Loading rooms...</p>`;

    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load rooms.");
    }

    const rooms = Array.isArray(data) ? data : data.rooms || [];

    if (!rooms.length) {
      container.innerHTML = `<p>No available rooms found.</p>`;
      return;
    }

    container.innerHTML = rooms
      .map((room) => {
        return `
          <div class="room-ai-card">
            <img
              src="${escapeHtml(room.image || "images/no-image.jpg")}"
              alt="${escapeHtml(room.room_name || "Room")}"
              onerror="this.src='images/no-image.jpg'"
            />

            <div class="room-ai-content">
              <h3>${escapeHtml(room.room_name || "N/A")}</h3>
              <p>${escapeHtml(room.description || "No description available.")}</p>
              <div class="room-price">₱${formatMoney(room.price)} per night</div>

              <div class="room-ai-meta">
                <div><strong>Capacity:</strong> ${room.capacity || 0}</div>
                <div><strong>Bed Count:</strong> ${room.bed_count || 0}</div>
                <div><strong>Bed Type:</strong> ${escapeHtml(room.bed_type || "N/A")}</div>
                <div><strong>View:</strong> ${capitalize(room.view_type || "N/A")}</div>
                <div><strong>Aircon:</strong> ${capitalize(room.aircon_type || "N/A")}</div>
                <div><strong>Status:</strong> ${capitalize(room.status || "available")}</div>
              </div>

              <div class="room-ai-amenities">
                <strong>Amenities:</strong> ${escapeHtml(room.amenities || "N/A")}
              </div>

              <div class="room-ai-actions">
                <a href="booking.html?room_id=${room.id}" class="book-now-btn">Book Now</a>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("loadRooms error:", error);
    container.innerHTML = `<p>Failed to load rooms.</p>`;
  }
}

function formatMoney(value) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function capitalize(text) {
  if (!text) return "";
  const value = String(text);
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}