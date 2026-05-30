// ============================================================
// SMARTRESORT ADMIN ROOMS SCRIPT
// Purpose:
// - Check admin access
// - Load/create categories
// - Create/edit/delete accommodations
// - Preview cover and gallery images
// - Search and filter accommodation inventory
// - Load accommodation inventory
// - Works from frontend/adminHTML/admin-rooms.html
// ============================================================

const API_BASE = "http://127.0.0.1:5000/api";

let categories = [];
let allRooms = [];

// ============================================================
// SECTION 1: Page startup
// Checks access, sets events, loads categories and accommodations.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupLogout();
  setupForm();
  setupRoomSearch();
  loadCategories();
  loadRooms();
});

// ============================================================
// SECTION 2: Admin access checker
// Allows admin users only.
// ============================================================

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "../index.html";
    return;
  }
}

// ============================================================
// SECTION 3: Logout
// Clears current user and returns to login page.
// ============================================================

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    localStorage.removeItem("user");
    showMessage("Logged out successfully.", "success");

    setTimeout(() => {
      window.location.href = "../authHTML/login.html";
    }, 700);
  });
}

// ============================================================
// SECTION 4: Setup form events
// Connects form submit, clear, previews, category, and seed buttons.
// ============================================================

function setupForm() {
  const roomForm = document.getElementById("roomForm");
  const clearFormBtn = document.getElementById("clearFormBtn");
  const roomImage = document.getElementById("roomImage");
  const galleryImages = document.getElementById("galleryImages");
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

  if (galleryImages) {
    galleryImages.addEventListener("input", updateGalleryPreview);
  }

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", createCategory);
  }

  if (seedDefaultsBtn) {
    seedDefaultsBtn.addEventListener("click", seedDefaults);
  }
}

// ============================================================
// SECTION 5: Setup search and filters
// Allows admin to quickly find accommodations.
// ============================================================

function setupRoomSearch() {
  const searchInput = document.getElementById("adminRoomSearch");
  const categoryFilter = document.getElementById("adminCategoryFilter");
  const statusFilter = document.getElementById("adminStatusFilter");
  const clearSearchBtn = document.getElementById("clearRoomSearchBtn");

  if (searchInput) {
    searchInput.addEventListener("input", applyRoomFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyRoomFilters);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyRoomFilters);
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (categoryFilter) categoryFilter.value = "";
      if (statusFilter) statusFilter.value = "";

      applyRoomFilters();
      searchInput?.focus();
    });
  }
}

// ============================================================
// SECTION 6: Load categories
// Populates the accommodation category dropdown and filter dropdown.
// ============================================================

async function loadCategories() {
  const categorySelect = document.getElementById("categoryId");
  const categoryFilter = document.getElementById("adminCategoryFilter");

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

    if (categoryFilter) {
      categoryFilter.innerHTML = `
        <option value="">All Categories</option>

        ${categories
          .map(
            (category) => `
              <option value="${escapeHtml(category.name)}">
                ${escapeHtml(category.name)}
              </option>
            `
          )
          .join("")}
      `;
    }
  } catch (error) {
    console.error("loadCategories error:", error);

    categorySelect.innerHTML = `<option value="">Failed to load categories</option>`;
    showMessage(error.message || "Failed to load categories.", "error");
  }
}

// ============================================================
// SECTION 7: Create category
// Adds a new accommodation category.
// ============================================================

async function createCategory() {
  const name = document.getElementById("categoryName").value.trim();

  const description = document
    .getElementById("categoryDescription")
    .value.trim();

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

// ============================================================
// SECTION 8: Seed default accommodations
// Calls backend seed route.
// ============================================================

async function seedDefaults() {
  try {
    const response = await fetch(`${API_BASE}/rooms/seed-defaults`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to seed default accommodations.");
    }

    showMessage(
      data.message || "Default accommodations seeded successfully.",
      "success"
    );

    loadRooms();
  } catch (error) {
    console.error("seedDefaults error:", error);

    showMessage(
      error.message || "Failed to seed default accommodations.",
      "error"
    );
  }
}

// ============================================================
// SECTION 9: Save accommodation
// Creates new accommodation or updates existing one.
// ============================================================

async function handleRoomSubmit(e) {
  e.preventDefault();

  const roomId = document.getElementById("roomId").value.trim();

  const payload = {
    category_id: document.getElementById("categoryId").value.trim(),
    name: document.getElementById("roomName").value.trim(),
    description: document.getElementById("roomDescription").value.trim(),
    max_capacity: document.getElementById("roomCapacity").value.trim(),
    image: document.getElementById("roomImage").value.trim(),
    gallery_images: getGalleryImagesFromInput(),
    map_label: document.getElementById("mapLabel").value.trim(),
    status: document.getElementById("roomStatus").value.trim(),

    day_price: document.getElementById("roomPrice").value.trim(),
    overnight_price: document.getElementById("overnightPrice").value.trim(),
    extended_price: document.getElementById("extendedPrice").value.trim(),

    day_start_time: document.getElementById("dayStartTime").value.trim(),
    day_end_time: document.getElementById("dayEndTime").value.trim(),

    overnight_start_time: document
      .getElementById("overnightStartTime")
      .value.trim(),

    overnight_end_time: document
      .getElementById("overnightEndTime")
      .value.trim(),

    extended_start_time: document
      .getElementById("extendedStartTime")
      .value.trim(),

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

// ============================================================
// SECTION 10: Load rooms
// Fetches accommodation inventory then renders filtered cards.
// ============================================================

async function loadRooms() {
  const container = document.getElementById("adminRoomsContainer");
  if (!container) return;

  try {
    container.innerHTML = renderRoomsMessage(
      "Loading accommodation inventory...",
      "#475569",
      "#dbe7ef"
    );

    updateRoomsCount(0, 0);
    updateSearchResultText("Loading accommodations...");

    const response = await fetch(`${API_BASE}/rooms`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load accommodations.");
    }

    allRooms = Array.isArray(data) ? data : data.rooms || [];

    applyRoomFilters();
  } catch (error) {
    console.error("loadRooms error:", error);

    container.innerHTML = renderRoomsMessage(
      "Failed to load accommodations.",
      "#991b1b",
      "#fecaca"
    );

    updateRoomsCount(0, 0);
    updateSearchResultText("Failed to load accommodations.");
  }
}

// ============================================================
// SECTION 11: Apply search and filters
// Filters by search text, category, and status.
// ============================================================

function applyRoomFilters() {
  const searchInput = document.getElementById("adminRoomSearch");
  const categoryFilter = document.getElementById("adminCategoryFilter");
  const statusFilter = document.getElementById("adminStatusFilter");

  const searchTerm = normalizeSearch(searchInput?.value || "");
  const selectedCategory = normalizeSearch(categoryFilter?.value || "");
  const selectedStatus = normalizeSearch(statusFilter?.value || "");

  const filteredRooms = allRooms.filter((room) => {
    const roomStatus = normalizeSearch(room.status || "available");
    const roomCategory = normalizeSearch(room.category_name || "");

    const searchableText = normalizeSearch(
      [
        room.name,
        room.category_name,
        room.description,
        room.map_label,
        room.status,
        room.max_capacity,
        room.day_price,
        room.overnight_price,
        room.extended_price,
      ].join(" ")
    );

    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
    const matchesCategory =
      !selectedCategory || roomCategory === selectedCategory;
    const matchesStatus = !selectedStatus || roomStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  renderRooms(filteredRooms);
  updateRoomsCount(filteredRooms.length, allRooms.length);
  updateSearchResultText(getSearchResultMessage(filteredRooms.length, allRooms.length));
}

// ============================================================
// SECTION 12: Render rooms
// Renders accommodation inventory cards.
// ============================================================

function renderRooms(rooms) {
  const container = document.getElementById("adminRoomsContainer");
  if (!container) return;

  if (!allRooms.length) {
    container.innerHTML = renderRoomsMessage(
      "No accommodations found yet.",
      "#475569",
      "#dbe7ef"
    );
    return;
  }

  if (!rooms.length) {
    container.innerHTML = renderRoomsMessage(
      "No accommodations match your search or filters.",
      "#475569",
      "#dbe7ef"
    );
    return;
  }

  container.innerHTML = rooms
    .map((room) => {
      const roomStatus = String(room.status || "available").toLowerCase();

      const galleryImages = Array.isArray(room.gallery_images)
        ? room.gallery_images
        : [];

      const coverImage = resolveImagePath(room.image || "images/no-image.jpg");

      const galleryStrip = galleryImages.length
        ? `
          <div class="room-gallery-strip">
            ${galleryImages
              .slice(0, 8)
              .map((img) => {
                const imagePath = resolveImagePath(img);

                return `
                  <img
                    src="${escapeHtml(imagePath)}"
                    alt="${escapeHtml(room.name || "Gallery image")}"
                    onerror="this.src='../images/no-image.jpg'"
                  />
                `;
              })
              .join("")}
          </div>
        `
        : "";

      return `
        <div class="room-admin-card">
          <img
            src="${escapeHtml(coverImage)}"
            alt="${escapeHtml(room.name || "Accommodation")}"
            onerror="this.src='../images/no-image.jpg'"
          />

          ${galleryStrip}

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
            <p><strong>Gallery Photos:</strong> ${galleryImages.length}</p>

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
              <button class="btn-edit" onclick="editRoom(${room.id})">
                Edit Accommodation
              </button>

              <button class="btn-delete" onclick="deleteRoom(${room.id})">
                Delete / Hide
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// ============================================================
// SECTION 13: Search helper messages
// ============================================================

function updateRoomsCount(filteredCount, totalCount) {
  const badge = document.getElementById("roomsCountBadge");
  if (!badge) return;

  if (!totalCount) {
    badge.textContent = "0 accommodations";
    return;
  }

  if (filteredCount === totalCount) {
    badge.textContent = `${totalCount} accommodation(s)`;
  } else {
    badge.textContent = `${filteredCount} of ${totalCount} shown`;
  }
}

function updateSearchResultText(message) {
  const text = document.getElementById("roomSearchResultText");
  if (!text) return;

  text.textContent = message;
}

function getSearchResultMessage(filteredCount, totalCount) {
  if (!totalCount) {
    return "No accommodations available.";
  }

  if (filteredCount === totalCount) {
    return "Showing all accommodations.";
  }

  if (filteredCount === 0) {
    return "No results found. Try another name, category, status, or location label.";
  }

  return `Showing ${filteredCount} result(s) out of ${totalCount}.`;
}

function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// ============================================================
// SECTION 14: Render message card
// Shows loading, empty, or error state.
// ============================================================

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

// ============================================================
// SECTION 15: Edit room
// Loads selected accommodation details into form.
// ============================================================

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

    document.getElementById("dayStartTime").value = formatTimeInput(
      room.day_start_time
    );

    document.getElementById("dayEndTime").value = formatTimeInput(
      room.day_end_time
    );

    document.getElementById("overnightStartTime").value = formatTimeInput(
      room.overnight_start_time
    );

    document.getElementById("overnightEndTime").value = formatTimeInput(
      room.overnight_end_time
    );

    document.getElementById("extendedStartTime").value = formatTimeInput(
      room.extended_start_time
    );

    document.getElementById("extendedEndTime").value = formatTimeInput(
      room.extended_end_time
    );

    const galleryImages = Array.isArray(room.gallery_images)
      ? room.gallery_images
      : [];

    const galleryInput = document.getElementById("galleryImages");

    if (galleryInput) {
      galleryInput.value = galleryImages.join("\n");
    }

    document.getElementById("formTitle").textContent = "Edit Accommodation";
    document.getElementById("saveRoomBtn").textContent = "Update Accommodation";

    updateImagePreview();
    updateGalleryPreview();

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("editRoom error:", error);
    showMessage(error.message || "Failed to load accommodation data.", "error");
  }
}

// ============================================================
// SECTION 16: Delete / hide room
// Deletes room or marks unavailable depending on backend logic.
// ============================================================

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

// ============================================================
// SECTION 17: Clear form
// Resets add/edit form and previews.
// ============================================================

function clearForm() {
  document.getElementById("roomForm").reset();
  document.getElementById("roomId").value = "";
  document.getElementById("formTitle").textContent = "Add New Accommodation";
  document.getElementById("saveRoomBtn").textContent = "Save Accommodation";

  const preview = document.getElementById("imagePreview");
  const previewText = document.getElementById("imagePreviewText");

  if (preview) {
    preview.style.display = "none";
    preview.src = "";
  }

  if (previewText) {
    previewText.textContent = "No image selected.";
  }

  const galleryPreview = document.getElementById("galleryPreview");
  const galleryPreviewText = document.getElementById("galleryPreviewText");

  if (galleryPreview) {
    galleryPreview.innerHTML = "";
  }

  if (galleryPreviewText) {
    galleryPreviewText.textContent = "No gallery images added.";
  }
}

// ============================================================
// SECTION 18: Cover image preview
// Shows preview for cover image input.
// ============================================================

function updateImagePreview() {
  const value = document.getElementById("roomImage").value.trim();
  const preview = document.getElementById("imagePreview");
  const previewText = document.getElementById("imagePreviewText");

  if (!preview || !previewText) return;

  if (!value) {
    preview.style.display = "none";
    preview.src = "";
    previewText.textContent = "No image selected.";
    return;
  }

  preview.src = resolveImagePath(value);
  preview.onerror = () => {
    preview.src = "../images/no-image.jpg";
  };

  preview.style.display = "block";
  previewText.textContent = value;
}

// ============================================================
// SECTION 19: Gallery preview
// Shows preview thumbnails for gallery image links.
// ============================================================

function updateGalleryPreview() {
  const images = getGalleryImagesFromInput();
  const galleryPreview = document.getElementById("galleryPreview");
  const galleryPreviewText = document.getElementById("galleryPreviewText");

  if (!galleryPreview || !galleryPreviewText) return;

  if (!images.length) {
    galleryPreview.innerHTML = "";
    galleryPreviewText.textContent = "No gallery images added.";
    return;
  }

  galleryPreviewText.textContent = `${images.length} gallery image(s) added.`;

  galleryPreview.innerHTML = images
    .map((imageUrl) => {
      const resolvedPath = resolveImagePath(imageUrl);

      return `
        <div class="gallery-preview-item">
          <img
            src="${escapeHtml(resolvedPath)}"
            alt="Gallery preview"
            onerror="this.src='../images/no-image.jpg'"
          />
          <span>${escapeHtml(imageUrl)}</span>
        </div>
      `;
    })
    .join("");
}

// ============================================================
// SECTION 20: Gallery input parser
// Reads one image per line or comma.
// ============================================================

function getGalleryImagesFromInput() {
  const input = document.getElementById("galleryImages");
  if (!input) return [];

  return input.value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

// ============================================================
// SECTION 21: Image path resolver
// Fixes image paths because this page is inside adminHTML.
// Example: images/a.jpg becomes ../images/a.jpg for preview.
// ============================================================

function resolveImagePath(value) {
  const imagePath = String(value || "").trim();

  if (!imagePath) {
    return "../images/no-image.jpg";
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  if (imagePath.startsWith("../")) {
    return imagePath;
  }

  if (imagePath.startsWith("/uploads/")) {
    return `http://127.0.0.1:5000${imagePath}`;
  }

  if (imagePath.startsWith("uploads/")) {
    return `http://127.0.0.1:5000/${imagePath}`;
  }

  return `../${imagePath}`;
}

// ============================================================
// SECTION 22: Format helpers
// Formats money, time, labels, messages, and safe HTML.
// ============================================================

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

  if (hours === 0) {
    hours = 12;
  }

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