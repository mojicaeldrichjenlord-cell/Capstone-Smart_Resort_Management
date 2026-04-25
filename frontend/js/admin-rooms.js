const API_BASE = "http://127.0.0.1:5000/api";

let categories = [];

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupLogout();
  setupForm();
  loadCategories();
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
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const seedDefaultsBtn = document.getElementById("seedDefaultsBtn");

  if (roomForm) {
    roomForm.addEventListener("submit", handleRoomSubmit);
  }

  if (clearFormBtn) {
    clearFormBtn.addEventListener("click", clearForm);
  }

  if (roomImage) {
    roomImage.addEventListener("input", updateImagePreview);
  }

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", createCategory);
  }

  if (seedDefaultsBtn) {
    seedDefaultsBtn.addEventListener("click", seedDefaults);
  }
}

async function loadCategories() {
  const categorySelect = document.getElementById("categoryId");
  if (!categorySelect) return;

  try {
    const response = await fetch(`${API_BASE}/rooms/categories`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load categories.");
    }

    categories = data.categories || [];

    categorySelect.innerHTML = `
      <option value="">Select category</option>
      ${categories
        .map(
          (category) => `
            <option value="${category.id}">
              ${escapeHtml(category.name)}
            </option>
          `
        )
        .join("")}
    `;
  } catch (error) {
    console.error("loadCategories error:", error);
    categorySelect.innerHTML = `<option value="">Failed to load categories</option>`;
    showMessage(error.message || "Failed to load categories.", "error");
  }
}

async function createCategory() {
  const name = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("categoryDescription").value.trim();

  if (!name) {
    showMessage("Category name is required.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/rooms/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add category.");
    }

    showMessage(data.message || "Category added successfully.", "success");
    document.getElementById("categoryName").value = "";
    document.getElementById("categoryDescription").value = "";
    await loadCategories();
  } catch (error) {
    console.error("createCategory error:", error);
    showMessage(error.message || "Failed to add category.", "error");
  }
}

async function seedDefaults() {
  try {
    const response = await fetch(`${API_BASE}/rooms/seed-defaults`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to seed default accommodations.");
    }

    showMessage(data.message || "Default accommodations seeded successfully.", "success");
    loadRooms();
  } catch (error) {
    console.error("seedDefaults error:", error);
    showMessage(error.message || "Failed to seed default accommodations.", "error");
  }
}

async function handleRoomSubmit(e) {
  e.preventDefault();

  const roomId = document.getElementById("roomId").value.trim();

  const payload = {
    category_id: document.getElementById("categoryId").value.trim(),
    name: document.getElementById("roomName").value.trim(),
    description: document.getElementById("roomDescription").value.trim(),
    max_capacity: document.getElementById("roomCapacity").value.trim(),
    image: document.getElementById("roomImage").value.trim(),
    map_label: document.getElementById("mapLabel").value.trim(),
    status: document.getElementById("roomStatus").value.trim(),

    day_price: document.getElementById("roomPrice").value.trim(),
    overnight_price: document.getElementById("overnightPrice").value.trim(),
    extended_price: document.getElementById("extendedPrice").value.trim(),

    day_start_time: document.getElementById("dayStartTime").value.trim(),
    day_end_time: document.getElementById("dayEndTime").value.trim(),
    overnight_start_time: document.getElementById("overnightStartTime").value.trim(),
    overnight_end_time: document.getElementById("overnightEndTime").value.trim(),
    extended_start_time: document.getElementById("extendedStartTime").value.trim(),
    extended_end_time: document.getElementById("extendedEndTime").value.trim(),
  };

  if (
    !payload.category_id ||
    !payload.name ||
    !payload.description ||
    !payload.status ||
    !payload.day_price ||
    !payload.overnight_price ||
    !payload.extended_price ||
    !payload.day_start_time ||
    !payload.day_end_time ||
    !payload.overnight_start_time ||
    !payload.overnight_end_time ||
    !payload.extended_start_time ||
    !payload.extended_end_time
  ) {
    showMessage("Please fill in all required accommodation fields.", "error");
    return;
  }

  const saveBtn = document.getElementById("saveRoomBtn");
  const originalBtnText = saveBtn ? saveBtn.textContent : "Save Accommodation";

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = roomId ? "Updating..." : "Saving...";
      saveBtn.style.opacity = "0.75";
      saveBtn.style.cursor = "not-allowed";
    }

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
      throw new Error(data.message || "Failed to save accommodation.");
    }

    showMessage(data.message || "Accommodation saved successfully.", "success");
    clearForm();
    loadRooms();
  } catch (error) {
    console.error("handleRoomSubmit error:", error);
    showMessage(error.message || "Failed to save accommodation.", "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = originalBtnText;
      saveBtn.style.opacity = "1";
      saveBtn.style.cursor = "pointer";
    }
  }
}

async function loadRooms() {
  const container = document.getElementById("adminRoomsContainer");
  if (!container) return;

  try {
    container.innerHTML = renderRoomsMessage(
      "Loading accommodation inventory...",
      "#475569",
      "#dbe7ef"
    );

    const response = await fetch(`${API_BASE}/rooms`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load accommodations.");
    }

    const rooms = Array.isArray(data) ? data : data.rooms || [];

    if (!rooms.length) {
      container.innerHTML = renderRoomsMessage(
        "No accommodations found yet.",
        "#475569",
        "#dbe7ef"
      );
      return;
    }

    container.innerHTML = rooms
      .map((room) => {
        const roomStatus = String(room.status || "available").toLowerCase();

        return `
          <div class="room-admin-card">
            <img
              src="${escapeHtml(room.image || "images/no-image.jpg")}"
              alt="${escapeHtml(room.name || "Accommodation")}"
              onerror="this.src='images/no-image.jpg'"
            />

            <div class="room-admin-content">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap;margin-bottom:10px;">
                <h3>${escapeHtml(room.name || "N/A")}</h3>
                <span class="room-status-badge status-${roomStatus}">
                  ${capitalize(roomStatus)}
                </span>
              </div>

              <p><strong>Category:</strong> ${escapeHtml(room.category_name || "N/A")}</p>
              <p><strong>Description:</strong> ${escapeHtml(room.description || "N/A")}</p>
              <p><strong>Map Label:</strong> ${escapeHtml(room.map_label || "Not set")}</p>

              <div class="room-meta">
                <div><strong>Max Capacity</strong><br>${room.max_capacity || 0}</div>
                <div><strong>Day Tour</strong><br>₱${formatMoney(room.day_price)}</div>
                <div><strong>Overnight</strong><br>₱${formatMoney(room.overnight_price)}</div>
                <div><strong>22/23 Hours</strong><br>₱${formatMoney(room.extended_price)}</div>
                <div><strong>Day Time</strong><br>${formatTimeRange(room.day_start_time, room.day_end_time)}</div>
                <div><strong>Overnight Time</strong><br>${formatTimeRange(room.overnight_start_time, room.overnight_end_time)}</div>
              </div>

              <div class="room-amenities-box">
                <strong>Extended Slot:</strong><br>
                ${formatTimeRange(room.extended_start_time, room.extended_end_time)}
              </div>

              <div class="room-admin-actions">
                <button class="btn-edit" onclick="editRoom(${room.id})">Edit Accommodation</button>
                <button class="btn-delete" onclick="deleteRoom(${room.id})">Delete / Hide</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("loadRooms error:", error);
    container.innerHTML = renderRoomsMessage(
      "Failed to load accommodations.",
      "#991b1b",
      "#fecaca"
    );
  }
}

function renderRoomsMessage(message, textColor, borderColor) {
  return `
    <div style="grid-column: 1 / -1;">
      <div style="
        background: rgba(255,255,255,0.96);
        border: 1px solid ${borderColor};
        border-radius: 22px;
        padding: 24px;
        text-align: center;
        color: ${textColor};
        box-shadow: 0 12px 28px rgba(15,23,42,0.08);
        font-weight: 700;
      ">
        ${message}
      </div>
    </div>
  `;
}

async function editRoom(roomId) {
  try {
    const response = await fetch(`${API_BASE}/rooms/${roomId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch accommodation.");
    }

    const room = data.room;

    document.getElementById("roomId").value = room.id || "";
    document.getElementById("categoryId").value = room.category_id || "";
    document.getElementById("roomName").value = room.name || "";
    document.getElementById("roomDescription").value = room.description || "";
    document.getElementById("roomCapacity").value = room.max_capacity || "";
    document.getElementById("roomImage").value = room.image || "";
    document.getElementById("mapLabel").value = room.map_label || "";
    document.getElementById("roomStatus").value = room.status || "available";

    document.getElementById("roomPrice").value = room.day_price || 0;
    document.getElementById("overnightPrice").value = room.overnight_price || 0;
    document.getElementById("extendedPrice").value = room.extended_price || 0;

    document.getElementById("dayStartTime").value = formatTimeInput(room.day_start_time);
    document.getElementById("dayEndTime").value = formatTimeInput(room.day_end_time);
    document.getElementById("overnightStartTime").value = formatTimeInput(room.overnight_start_time);
    document.getElementById("overnightEndTime").value = formatTimeInput(room.overnight_end_time);
    document.getElementById("extendedStartTime").value = formatTimeInput(room.extended_start_time);
    document.getElementById("extendedEndTime").value = formatTimeInput(room.extended_end_time);

    document.getElementById("formTitle").textContent = "Edit Accommodation";
    document.getElementById("saveRoomBtn").textContent = "Update Accommodation";

    updateImagePreview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("editRoom error:", error);
    showMessage(error.message || "Failed to load accommodation data.", "error");
  }
}

async function deleteRoom(roomId) {
  const confirmed = confirm(
    "Are you sure you want to delete this accommodation?\n\nNote: If it already has reservation history, it may only be set to unavailable."
  );
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/rooms/${roomId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete accommodation.");
    }

    showMessage(data.message || "Accommodation deleted successfully.", "success");
    loadRooms();
  } catch (error) {
    console.error("deleteRoom error:", error);
    showMessage(error.message || "Failed to delete accommodation.", "error");
  }
}

function clearForm() {
  document.getElementById("roomForm").reset();
  document.getElementById("roomId").value = "";
  document.getElementById("formTitle").textContent = "Add New Accommodation";
  document.getElementById("saveRoomBtn").textContent = "Save Accommodation";

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

function formatTimeInput(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

function formatTimeRange(start, end) {
  return `${formatTimeDisplay(start)} - ${formatTimeDisplay(end)}`;
}

function formatTimeDisplay(value) {
  if (!value) return "N/A";
  const timeText = String(value).trim();
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
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}