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


let categories = [];
let allRooms = [];

// Photos chosen by the admin are staged in memory until Save is clicked.
// Existing image URLs remain in hidden inputs, so Edit keeps existing photos.
let selectedGalleryFiles = [];
let coverPreviewObjectUrl = null;
let galleryPreviewObjectUrls = [];
const MAX_GALLERY_PHOTOS = 10;
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const MAX_SOURCE_PHOTO_BYTES = 12 * 1024 * 1024;

// Admin mutation requests MUST carry the signed session; the backend
// independently validates current Admin role before modifying inventory.
function adminInventoryHeaders(includeJson = true) {
  const token = sessionStorage.getItem("adminToken");
  if (!token) {
    throw new Error("Admin session expired. Please log in again.");
  }
  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: "Bearer " + token,
  };
}

// ============================================================
// SECTION 1: Page startup
// Checks access, sets events, loads categories and accommodations.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAccess()) return;
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
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Invalid stored account data:", error);
  }

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return false;
  }

  const role = String(user.role || "").trim().toLowerCase();
  if (role !== "admin") {
    const destinations = {
      customer: "../customerHTML/index.html",
      frontdesk: "../frontdeskHTML/frontdeskDashboard.html",
      staff: "../frontdeskHTML/frontdeskDashboard.html",
      manager: "../managerHTML/managerDashboard.html",
      housekeeping: "../housekeepingHTML/housekeepingDashboard.html",
    };
    alert("Access denied. Administrator account required.");
    window.location.href = destinations[role] || "../authHTML/login.html";
    return false;
  }

  return true;
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
    sessionStorage.removeItem("adminToken");
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
  const coverFile = document.getElementById("coverPhotoFile");
  const galleryPicker = document.getElementById("galleryPhotoFiles");
  const galleryPreview = document.getElementById("galleryPreview");
  const removeCover = document.getElementById("removeCoverPhotoBtn");
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const seedDefaultsBtn = document.getElementById("seedDefaultsBtn");

  roomForm?.addEventListener("submit", handleRoomSubmit);
  clearFormBtn?.addEventListener("click", clearForm);
  coverFile?.addEventListener("change", () => {
    const file = coverFile.files?.[0];
    if (file && !validatePhoto(file)) {
      coverFile.value = "";
      return;
    }
    updateImagePreview();
  });
  galleryPicker?.addEventListener("change", () => {
    const files = Array.from(galleryPicker.files || []);
    // Keep previous chosen photos when an admin opens the picker again.
    // We do not upload anything until the admin presses Save.
    galleryPicker.value = "";
    if (!files.length) return;
    if (files.some(file => !validatePhoto(file))) return;
    const current = getGalleryImagesFromInput().length + selectedGalleryFiles.length;
    if (current + files.length > MAX_GALLERY_PHOTOS) {
      showMessage("Maximum 10 gallery photos per accommodation.", "error");
      return;
    }
    selectedGalleryFiles.push(...files);
    updateGalleryPreview();
  });
  removeCover?.addEventListener("click", () => {
    // Remove only from the pending form. Saving is required to update the DB.
    if (coverFile) coverFile.value = "";
    document.getElementById("roomImage").value = "";
    updateImagePreview();
  });
  galleryPreview?.addEventListener("click", event => {
    const button = event.target.closest("button[data-photo-index]");
    if (!button) return;
    const index = Number(button.dataset.photoIndex);
    if (!Number.isSafeInteger(index) || index < 0) return;
    const saved = getGalleryImagesFromInput();
    if (button.dataset.photoKind === "saved") {
      if (index >= saved.length) return;
      saved.splice(index, 1);
      document.getElementById("galleryImages").value = JSON.stringify(saved);
    } else {
      if (index >= selectedGalleryFiles.length) return;
      selectedGalleryFiles.splice(index, 1);
    }
    updateGalleryPreview();
  });
  addCategoryBtn?.addEventListener("click", createCategory);
  seedDefaultsBtn?.addEventListener("click", seedDefaults);
}

// The browser file extension can lie. Backend checks the file signature too.
function validatePhoto(file) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type) || file.size > MAX_SOURCE_PHOTO_BYTES ||
      file.size < 100) {
    showMessage("Choose JPG, PNG or WebP photos between 100 bytes and 12 MB.", "error");
    return false;
  }
  return true;
}

// On large camera images we resize a local copy before upload.
// The original selected file on the admin's device is not changed.
async function preparePhotoForUpload(file) {
  if (file.size <= MAX_PHOTO_BYTES) return file;
  if (typeof createImageBitmap !== "function") {
    throw new Error("This browser cannot optimize large photos. Choose a photo under 3 MB.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    // 1600px is enough for resort cards/gallery and keeps MySQL space bounded.
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not optimize photo in this browser.");
    // White background avoids black areas when transparent PNG -> JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.88, 0.75, 0.6]) {
      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );
      if (blob && blob.size >= 100 && blob.size <= MAX_PHOTO_BYTES) {
        return new File([blob], "resort-photo.jpg", { type: "image/jpeg" });
      }
    }
    throw new Error("Photo is too large even after optimization.");
  } finally {
    bitmap.close?.();
  }
}

// One signed upload per photo. MySQL stores photo bytes on Aiven so files
// do not disappear when Render restarts or redeploys.
async function uploadAdminPhoto(file) {
  const optimized = await preparePhotoForUpload(file);
  const form = new FormData();
  form.append("image", optimized, optimized.name);
  const response = await fetch(`${API_BASE}/rooms/media`, {
    method: "POST",
    headers: adminInventoryHeaders(false),
    body: form
  });
  const data = await response.json();
  if (!response.ok || !/^\/api\/rooms\/media\/[1-9]\d*$/.test(data.path || "")) {
    throw new Error(data.message || "Could not upload photo.");
  }
  return data.path;
}

async function uploadSelectedPhotos(payload) {
  const coverFile = document.getElementById("coverPhotoFile");
  const statusText = document.getElementById("photoUploadStatus");
  const cover = coverFile.files?.[0];
  const total = (cover ? 1 : 0) + selectedGalleryFiles.length;
  let completed = 0;
  if (cover) {
    statusText.textContent = `Uploading cover photo (1/${total})...`;
    const path = await uploadAdminPhoto(cover);
    payload.image = path;
    document.getElementById("roomImage").value = path;
    coverFile.value = "";
    completed++;
    updateImagePreview();
  }
  // Successful uploads are moved to saved paths immediately: retrying a
  // failed accommodation save won't upload the same picture twice.
  while (selectedGalleryFiles.length) {
    const file = selectedGalleryFiles[0];
    statusText.textContent = `Uploading gallery photo (${completed + 1}/${total})...`;
    const path = await uploadAdminPhoto(file);
    payload.gallery_images.push(path);
    document.getElementById("galleryImages").value = JSON.stringify(payload.gallery_images);
    selectedGalleryFiles.shift();
    completed++;
    updateGalleryPreview();
  }
  if (total) statusText.textContent = "All photos uploaded. Saving accommodation...";
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
      headers: adminInventoryHeaders(),
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
  // Only seed during intentional setup. Existing inventory may already represent
  // real resort accommodations, so never write example rows with one accidental tap.
  const approved = confirm(
    "Seed Default Accommodations will add example records if their names are missing. " +
    "It will not replace your existing accommodations, but it can add sample items " +
    "to the database. Continue?"
  );
  if (!approved) return;

  try {
    const response = await fetch(`${API_BASE}/rooms/seed-defaults`, {
      method: "POST",
      headers: adminInventoryHeaders(false),
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
    amenities: document.getElementById("roomAmenities").value.trim(),
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

    // Upload only newly selected photos; existing images remain unchanged.
    // If an upload fails, stop before modifying the accommodation record.
    await uploadSelectedPhotos(payload);

    let response;

    if (roomId) {
      response = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: "PUT",
        headers: adminInventoryHeaders(),
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch(`${API_BASE}/rooms`, {
        method: "POST",
        headers: adminInventoryHeaders(),
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
    document.getElementById("photoUploadStatus").textContent =
      "Save was not completed. Uploaded photos will be retained on this form for retry.";
    showMessage(error.message || "Failed to save accommodation.", "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      // After a successful edit, clearForm switches back to Add New.
      // Avoid restoring the old "Update Accommodation" label.
      saveBtn.textContent = document.getElementById("roomId").value
        ? "Update Accommodation" : "Save Accommodation";
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
        room.amenities,
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

            <div class="room-inclusions-box">
              <strong>Amenities / Inclusions:</strong>
              ${formatAmenitiesList(room.amenities)}
            </div>

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
    resetPhotoChoices();

    document.getElementById("roomId").value = room.id || "";
    document.getElementById("categoryId").value = room.category_id || "";
    document.getElementById("roomName").value = room.name || "";
    document.getElementById("roomDescription").value = room.description || "";
    document.getElementById("roomAmenities").value = room.amenities || "";
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
      galleryInput.value = JSON.stringify(galleryImages);
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
      headers: adminInventoryHeaders(false),
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

function resetPhotoChoices() {
  selectedGalleryFiles = [];
  const coverInput = document.getElementById("coverPhotoFile");
  const galleryInput = document.getElementById("galleryPhotoFiles");
  if (coverInput) coverInput.value = "";
  if (galleryInput) galleryInput.value = "";
  if (coverPreviewObjectUrl) {
    URL.revokeObjectURL(coverPreviewObjectUrl);
    coverPreviewObjectUrl = null;
  }
  galleryPreviewObjectUrls.forEach(url => URL.revokeObjectURL(url));
  galleryPreviewObjectUrls = [];
}

function clearForm() {
  document.getElementById("roomForm").reset();
  resetPhotoChoices();
  document.getElementById("roomId").value = "";
  document.getElementById("roomImage").value = "";
  document.getElementById("galleryImages").value = "";
  document.getElementById("formTitle").textContent = "Add New Accommodation";
  document.getElementById("saveRoomBtn").textContent = "Save Accommodation";
  document.getElementById("photoUploadStatus").textContent = "";
  updateImagePreview();
  updateGalleryPreview();
}

// SECTION 18: Cover preview: a new file takes priority over the saved image.
function updateImagePreview() {
  const input = document.getElementById("coverPhotoFile");
  const file = input.files?.[0];
  const previous = document.getElementById("roomImage").value.trim();
  const preview = document.getElementById("imagePreview");
  const text = document.getElementById("imagePreviewText");
  const removeButton = document.getElementById("removeCoverPhotoBtn");
  if (coverPreviewObjectUrl) URL.revokeObjectURL(coverPreviewObjectUrl);
  coverPreviewObjectUrl = file ? URL.createObjectURL(file) : null;
  const photo = coverPreviewObjectUrl || (previous ? resolveImagePath(previous) : "");
  preview.style.display = photo ? "block" : "none";
  if (photo) preview.src = photo;
  else preview.removeAttribute("src");
  preview.onerror = () => {
    preview.onerror = null;
    preview.src = "../images/no-image.jpg";
  };
  text.textContent = file ? `New photo: ${file.name}`
    : (previous ? "Current cover photo (choose another to replace)." : "No image selected.");
  removeButton.hidden = !file && !previous;
}

// SECTION 19: Gallery preview combines saved images with staged new files.
function updateGalleryPreview() {
  const stored = getGalleryImagesFromInput();
  const preview = document.getElementById("galleryPreview");
  const previewText = document.getElementById("galleryPreviewText");
  galleryPreviewObjectUrls.forEach(url => URL.revokeObjectURL(url));
  galleryPreviewObjectUrls = selectedGalleryFiles.map(file => URL.createObjectURL(file));
  const rows = [
    ...stored.map((path, index) => ({
      src: resolveImagePath(path), label: "Saved photo",
      kind: "saved", index
    })),
    ...selectedGalleryFiles.map((file, index) => ({
      src: galleryPreviewObjectUrls[index], label: file.name,
      kind: "pending", index
    }))
  ];
  previewText.textContent = rows.length
    ? `${rows.length} gallery photo(s). Select more or remove individual photos.`
    : "No gallery images added.";
  // Escaping paths and labels prevents saved filenames from injecting markup.
  preview.innerHTML = rows.map(row => `
    <div class="gallery-preview-item">
      <img src="${escapeHtml(row.src)}" alt="Gallery photo preview" />
      <span>${escapeHtml(row.label)}</span>
      <button type="button" data-photo-kind="${row.kind}"
        data-photo-index="${row.index}"
        aria-label="Remove gallery photo">Remove</button>
    </div>
  `).join("");
}

// SECTION 20: A hidden text input stores existing URLs and uploaded paths.
function getGalleryImagesFromInput() {
  const input = document.getElementById("galleryImages");
  if (!input) return [];
  // Hidden inputs serialize arrays as JSON so commas or line breaks inside
  // existing external photo URLs cannot corrupt the gallery on Edit.
  const raw = String(input.value || "").trim();
  if (!raw) return [];
  try {
    const paths = JSON.parse(raw);
    if (Array.isArray(paths)) {
      return paths.map(value => String(value || "").trim()).filter(Boolean);
    }
  } catch (_) {
    // Accept legacy newline-separated values during gradual upgrades.
  }
  return raw.split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
}

// SECTION 21: Existing project photos continue resolving as before.
function resolveImagePath(value) {
  const imagePath = String(value || "").trim();
  if (!imagePath) return "../images/no-image.jpg";
  // Newly uploaded photos are served by the Node backend (MySQL-backed).
  if (/^\/api\/rooms\/media\/[1-9]\d*$/.test(imagePath)) {
    return API_BASE.replace(/\/api\/?$/, "") + imagePath;
  }
  if (/^https?:\/\//.test(imagePath) ||
      imagePath.startsWith("data:") || imagePath.startsWith("blob:")) {
    return imagePath;
  }
  if (imagePath.startsWith("../")) return imagePath;
  if (imagePath.startsWith("/uploads/")) {
    return API_BASE.replace(/\/api\/?$/, "") + imagePath;
  }
  if (imagePath.startsWith("uploads/")) {
    return API_BASE.replace(/\/api\/?$/, "") + "/" + imagePath;
  }
  return "../" + imagePath.replace(/^\/+/, "");
}

// ============================================================
// SECTION 22A: Amenities formatter
// Converts multiline amenities into a clean bullet list.
// ============================================================

function formatAmenitiesList(value) {
  const items = String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) {
    return `<p class="empty-inclusions">No amenities or inclusions listed.</p>`;
  }

  return `
    <ul class="amenities-list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
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