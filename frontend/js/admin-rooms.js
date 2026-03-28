const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupLogout();
  setupForm();
  loadRooms();
});

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
    return;
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    showMessage("Logged out successfully.", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 700);
  });
}

function setupForm() {
  const roomForm = document.getElementById("roomForm");
  const clearFormBtn = document.getElementById("clearFormBtn");
  const roomImage = document.getElementById("roomImage");

  roomForm.addEventListener("submit", handleRoomSubmit);
  clearFormBtn.addEventListener("click", clearForm);
  roomImage.addEventListener("input", updateImagePreview);
}

async function handleRoomSubmit(e) {
  e.preventDefault();

  const roomId = document.getElementById("roomId").value.trim();
  const room_name = document.getElementById("roomName").value.trim();
  const description = document.getElementById("roomDescription").value.trim();
  const price = document.getElementById("roomPrice").value.trim();
  const capacity = document.getElementById("roomCapacity").value.trim();
  const bed_count = document.getElementById("bedCount").value.trim();
  const bed_type = document.getElementById("bedType").value.trim();
  const view_type = document.getElementById("viewType").value.trim();
  const aircon_type = document.getElementById("airconType").value.trim();
  const amenities = document.getElementById("roomAmenities").value.trim();
  const image = document.getElementById("roomImage").value.trim();
  const status = document.getElementById("roomStatus").value.trim();

  if (
    !room_name ||
    !description ||
    !price ||
    !capacity ||
    !bed_count ||
    !bed_type ||
    !view_type ||
    !aircon_type ||
    !amenities ||
    !status
  ) {
    showMessage("Please fill in all room fields.", "error");
    return;
  }

  const payload = {
    room_name,
    description,
    price,
    capacity,
    bed_count,
    bed_type,
    view_type,
    aircon_type,
    amenities,
    image,
    status,
  };

  try {
    let response;

    if (roomId) {
      response = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch(`${API_BASE}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save room.");
    }

    showMessage(data.message || "Room saved successfully.", "success");
    clearForm();
    loadRooms();
  } catch (error) {
    console.error("handleRoomSubmit error:", error);
    showMessage(error.message || "Failed to save room.", "error");
  }
}

async function loadRooms() {
  const container = document.getElementById("adminRoomsContainer");

  try {
    container.innerHTML = `<p>Loading rooms...</p>`;

    const response = await fetch(`${API_BASE}/rooms`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load rooms.");
    }

    const rooms = Array.isArray(data) ? data : data.rooms || [];

    if (!rooms.length) {
      container.innerHTML = `<p>No rooms found.</p>`;
      return;
    }

    container.innerHTML = rooms
      .map((room) => {
        const roomStatus = String(room.status || "available").toLowerCase();

        return `
          <div class="room-admin-card">
            <img
              src="${escapeHtml(room.image || "images/no-image.jpg")}"
              alt="${escapeHtml(room.room_name || "Room")}"
              onerror="this.src='images/no-image.jpg'"
            />

            <div class="room-admin-content">
              <h3>${escapeHtml(room.room_name || "N/A")}</h3>

              <p><strong>Description:</strong> ${escapeHtml(room.description || "N/A")}</p>
              <p><strong>Price:</strong> ₱${formatMoney(room.price)}</p>
              <p>
                <strong>Status:</strong>
                <span class="room-status-badge status-${roomStatus}">
                  ${capitalize(roomStatus)}
                </span>
              </p>

              <div class="room-meta">
                <div><strong>Capacity:</strong> ${room.capacity || 0}</div>
                <div><strong>Bed Count:</strong> ${room.bed_count || 0}</div>
                <div><strong>Bed Type:</strong> ${escapeHtml(room.bed_type || "N/A")}</div>
                <div><strong>View:</strong> ${capitalize(room.view_type || "N/A")}</div>
                <div><strong>Aircon:</strong> ${capitalize(room.aircon_type || "N/A")}</div>
              </div>

              <div class="room-amenities-box">
                <strong>Amenities:</strong> ${escapeHtml(room.amenities || "N/A")}
              </div>

              <div class="room-admin-actions">
                <button class="btn-edit" onclick="editRoom(${room.id})">Edit</button>
                <button class="btn-delete" onclick="deleteRoom(${room.id})">Delete</button>
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

async function editRoom(roomId) {
  try {
    const response = await fetch(`${API_BASE}/rooms/${roomId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch room.");
    }

    const room = data.room;

    document.getElementById("roomId").value = room.id || "";
    document.getElementById("roomName").value = room.room_name || "";
    document.getElementById("roomDescription").value = room.description || "";
    document.getElementById("roomPrice").value = room.price || "";
    document.getElementById("roomCapacity").value = room.capacity || "";
    document.getElementById("bedCount").value = room.bed_count || "";
    document.getElementById("bedType").value = room.bed_type || "";
    document.getElementById("viewType").value = room.view_type || "";
    document.getElementById("airconType").value = room.aircon_type || "";
    document.getElementById("roomAmenities").value = room.amenities || "";
    document.getElementById("roomImage").value = room.image || "";
    document.getElementById("roomStatus").value = room.status || "available";

    document.getElementById("formTitle").textContent = "Edit Room";
    document.getElementById("saveRoomBtn").textContent = "Update Room";

    updateImagePreview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("editRoom error:", error);
    showMessage(error.message || "Failed to load room data.", "error");
  }
}

async function deleteRoom(roomId) {
  const confirmed = confirm("Are you sure you want to delete this room?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/rooms/${roomId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete room.");
    }

    showMessage(data.message || "Room deleted successfully.", "success");
    loadRooms();
  } catch (error) {
    console.error("deleteRoom error:", error);
    showMessage(error.message || "Failed to delete room.", "error");
  }
}

function clearForm() {
  document.getElementById("roomForm").reset();
  document.getElementById("roomId").value = "";
  document.getElementById("formTitle").textContent = "Add New Room";
  document.getElementById("saveRoomBtn").textContent = "Save Room";

  const preview = document.getElementById("imagePreview");
  const previewText = document.getElementById("imagePreviewText");

  preview.style.display = "none";
  preview.src = "";
  previewText.textContent = "No image selected.";
}

function updateImagePreview() {
  const value = document.getElementById("roomImage").value.trim();
  const preview = document.getElementById("imagePreview");
  const previewText = document.getElementById("imagePreviewText");

  if (!value) {
    preview.style.display = "none";
    preview.src = "";
    previewText.textContent = "No image selected.";
    return;
  }

  preview.src = value;
  preview.style.display = "block";
  previewText.textContent = value;
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

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}