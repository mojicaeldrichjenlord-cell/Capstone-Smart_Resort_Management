const API_BASE = "http://127.0.0.1:5000/api";

let allRooms = [];
let currentFilter = "all";

let currentViewerImages = [];
let currentViewerIndex = 0;
let currentViewerCaption = "Accommodation Photo";

document.addEventListener("DOMContentLoaded", () => {
  setupLogout();
  setupCategoryFilters();
  setupImageViewerControls();
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

function setupCategoryFilters() {
  const filterButtons = document.querySelectorAll(".category-filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter || "all";

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      renderRooms(getFilteredRooms());
    });
  });
}

async function loadRooms() {
  const container = document.getElementById("roomsContainer");
  if (!container) return;

  try {
    container.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div style="
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(219,231,239,0.92);
          border-radius: 24px;
          padding: 22px;
          text-align: center;
          color: #475569;
          box-shadow: 0 12px 28px rgba(15,23,42,0.08);
        ">
          Loading available accommodations...
        </div>
      </div>
    `;

    updateCategoryCount("Loading...");

    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load accommodations.");
    }

    allRooms = Array.isArray(data) ? data : data.rooms || [];

    renderRooms(getFilteredRooms());
  } catch (error) {
    console.error("loadRooms error:", error);
    container.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div style="
          background: rgba(255,255,255,0.95);
          border: 1px solid #fecaca;
          border-radius: 24px;
          padding: 24px;
          text-align: center;
          color: #991b1b;
          box-shadow: 0 12px 28px rgba(15,23,42,0.08);
        ">
          Failed to load accommodations.
        </div>
      </div>
    `;

    updateCategoryCount("0 shown");
  }
}

function getFilteredRooms() {
  if (currentFilter === "all") return allRooms;

  return allRooms.filter((room) => {
    const group = getAccommodationGroup(room.category_name, room.name);
    return group === currentFilter;
  });
}

function getAccommodationGroup(categoryName, roomName = "") {
  const category = String(categoryName || "").toLowerCase();
  const name = String(roomName || "").toLowerCase();
  const combined = `${category} ${name}`;

  if (
    combined.includes("function") ||
    combined.includes("pavilion") ||
    combined.includes("pavillion") ||
    combined.includes("event") ||
    combined.includes("hall")
  ) {
    return "function-areas";
  }

  if (
    combined.includes("room") ||
    combined.includes("villa") ||
    combined.includes("suite") ||
    combined.includes("hotel")
  ) {
    return "rooms";
  }

  if (
    combined.includes("cottage") ||
    combined.includes("shade") ||
    combined.includes("kubo") ||
    combined.includes("nipa") ||
    combined.includes("hut") ||
    combined.includes("cabana")
  ) {
    return "cottages";
  }

  return "cottages";
}

function renderRooms(rooms) {
  const container = document.getElementById("roomsContainer");
  if (!container) return;

  updateCategoryCount(`${rooms.length} shown`);

  if (!allRooms.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div style="
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(219,231,239,0.92);
          border-radius: 24px;
          padding: 28px;
          text-align: center;
          color: #475569;
          box-shadow: 0 12px 28px rgba(15,23,42,0.08);
        ">
          No available accommodations found right now.
        </div>
      </div>
    `;
    return;
  }

  if (!rooms.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div style="
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(219,231,239,0.92);
          border-radius: 24px;
          padding: 28px;
          text-align: center;
          color: #475569;
          box-shadow: 0 12px 28px rgba(15,23,42,0.08);
        ">
          No accommodations found for this category.
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = rooms
    .map((room) => {
      const imageSrc = escapeHtml(room.image || "images/no-image.jpg");
      const itemName = escapeHtml(room.name || "N/A");
      const itemDescription = escapeHtml(
        room.description || "No description available."
      );
      const categoryName = escapeHtml(room.category_name || "Accommodation");
      const displayGroup = getGroupLabel(
        getAccommodationGroup(room.category_name, room.name)
      );
      const mapLabel = escapeHtml(room.map_label || "Not set");
      const dayPrice = formatMoney(room.day_price);
      const overnightPrice = formatMoney(room.overnight_price);
      const extendedPrice = formatMoney(room.extended_price);
      const maxCapacity = room.max_capacity || 0;
      const status = capitalize(room.status || "available");
      const extendedSlotLabel = getExtendedLabel(room.category_name, true);
      const galleryImages = Array.isArray(room.gallery_images)
        ? room.gallery_images
        : [];

      const galleryStrip = galleryImages.length
        ? `
          <div class="room-gallery-strip">
            ${galleryImages
              .slice(0, 8)
              .map(
                (img) => `
                  <img
                    src="${escapeHtml(img)}"
                    alt="${itemName} photo"
                    onclick="openImageViewerFromRoom(${room.id}, '${escapeForJs(img)}', '${escapeForJs(room.name || "Accommodation")}')"
                    style="cursor:pointer;"
                    onerror="this.src='images/no-image.jpg'"
                  />
                `
              )
              .join("")}
          </div>
        `
        : "";

      return `
        <div class="room-ai-card">
          <div class="room-photo-wrap">
            <img
              src="${imageSrc}"
              alt="${itemName}"
              onclick="openImageViewerFromRoom(${room.id}, '${escapeForJs(room.image || "images/no-image.jpg")}', '${escapeForJs(room.name || "Accommodation")}')"
              style="cursor:pointer;"
              onerror="this.src='images/no-image.jpg'"
            />

            <div style="
              position: absolute;
              top: 14px;
              left: 14px;
              background: rgba(15, 23, 42, 0.82);
              color: white;
              padding: 8px 12px;
              border-radius: 999px;
              font-size: 0.84rem;
              font-weight: 700;
              backdrop-filter: blur(8px);
            ">
              ${displayGroup}
            </div>

            <div style="
              position: absolute;
              top: 14px;
              right: 14px;
              background: rgba(255,255,255,0.92);
              color: #0f172a;
              padding: 8px 12px;
              border-radius: 999px;
              font-size: 0.82rem;
              font-weight: 800;
            ">
              ${status}
            </div>
          </div>

          ${galleryStrip}

          <div class="room-ai-content">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px;">
              <h3 style="margin:0;">${itemName}</h3>
            </div>

            <p>${itemDescription}</p>

            <div class="room-price">Best for up to ${maxCapacity} pax</div>

            <div class="room-ai-meta">
              <div><strong>Category</strong><br>${categoryName}</div>
              <div><strong>Type</strong><br>${displayGroup}</div>
              <div><strong>Max Capacity</strong><br>${maxCapacity} guest(s)</div>
              <div><strong>Morning / Day Tour</strong><br>₱${dayPrice}</div>
              <div><strong>Evening / Overnight</strong><br>₱${overnightPrice}</div>
              <div><strong>${extendedSlotLabel}</strong><br>₱${extendedPrice}</div>
              <div><strong>Map Location</strong><br>${mapLabel}</div>
              <div><strong>Photos</strong><br>${
                galleryImages.length
                  ? galleryImages.length + " gallery photo(s)"
                  : "Cover photo only"
              }</div>
            </div>

            <div class="room-ai-amenities">
              <strong>Schedule Preview:</strong><br>
              Day Tour: ${formatTimeRange(room.day_start_time, room.day_end_time)}<br>
              Overnight: ${formatTimeRange(room.overnight_start_time, room.overnight_end_time)}<br>
              ${extendedSlotLabel}: ${formatTimeRange(room.extended_start_time, room.extended_end_time)}
            </div>

            <div class="room-ai-actions">
              <a href="booking.html?room_id=${room.id}" class="book-now-btn">Reserve This</a>

              <button
                type="button"
                class="ask-ai-btn"
                onclick="openAiForRoom('${escapeForJs(room.name || "")}', ${room.id})"
              >
                Ask AI About This
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function updateCategoryCount(text) {
  const categoryCount = document.getElementById("categoryCount");
  if (categoryCount) {
    categoryCount.textContent = text;
  }
}

function getGroupLabel(group) {
  if (group === "rooms") return "Rooms";
  if (group === "function-areas") return "Function Areas";
  if (group === "cottages") return "Cottages";
  return "All";
}

function getExtendedLabel(categoryName, isExtended = true) {
  const value = String(categoryName || "").toLowerCase();

  if (!isExtended) return "Day Tour";

  if (value.includes("room")) return "22 Hours";
  return "23 Hours";
}

function openAiForRoom(roomName, roomId) {
  const chatWindow = document.getElementById("aiChatWindow");
  const input = document.getElementById("aiChatInput");

  if (chatWindow) {
    chatWindow.classList.add("show");
  }

  if (input) {
    input.value = `Recommend this accommodation for me: ${roomName}`;
    input.focus();
  }

  try {
    const savedContext = JSON.parse(
      localStorage.getItem("smartresort_ai_context_v1") || "{}"
    );

    savedContext.room_name = roomName;
    savedContext.room_id = roomId;

    localStorage.setItem(
      "smartresort_ai_context_v1",
      JSON.stringify(savedContext)
    );
  } catch (error) {
    console.error("openAiForRoom context save error:", error);
  }
}

function openImageViewerFromRoom(
  roomId,
  selectedImage,
  captionText = "Accommodation Photo"
) {
  const room = allRooms.find((item) => Number(item.id) === Number(roomId));

  const images = [];

  if (room && room.image) {
    images.push(room.image);
  }

  if (room && Array.isArray(room.gallery_images)) {
    room.gallery_images.forEach((img) => {
      if (img && !images.includes(img)) {
        images.push(img);
      }
    });
  }

  if (!images.length) {
    images.push(selectedImage || "images/no-image.jpg");
  }

  const selectedIndex = images.findIndex((img) => img === selectedImage);

  currentViewerImages = images;
  currentViewerIndex = selectedIndex >= 0 ? selectedIndex : 0;
  currentViewerCaption = captionText || "Accommodation Photo";

  showCurrentViewerImage();
}

function showCurrentViewerImage() {
  const modal = document.getElementById("imageViewerModal");
  const image = document.getElementById("imageViewerImg");
  const caption = document.getElementById("imageViewerCaption");
  const counter = document.getElementById("imageViewerCounter");

  if (!modal || !image || !caption) return;

  const currentImage =
    currentViewerImages[currentViewerIndex] || "images/no-image.jpg";

  image.src = currentImage;
  caption.textContent = currentViewerCaption;

  if (counter) {
    counter.textContent = `${currentViewerIndex + 1} of ${
      currentViewerImages.length
    }`;
  }

  modal.classList.add("show");
}

function showPreviousImage() {
  if (!currentViewerImages.length) return;

  currentViewerIndex =
    (currentViewerIndex - 1 + currentViewerImages.length) %
    currentViewerImages.length;

  showCurrentViewerImage();
}

function showNextImage() {
  if (!currentViewerImages.length) return;

  currentViewerIndex = (currentViewerIndex + 1) % currentViewerImages.length;

  showCurrentViewerImage();
}

function closeImageViewer() {
  const modal = document.getElementById("imageViewerModal");
  const image = document.getElementById("imageViewerImg");

  if (!modal || !image) return;

  modal.classList.remove("show");
  image.src = "";
  currentViewerImages = [];
  currentViewerIndex = 0;
}

function setupImageViewerControls() {
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("imageViewerModal");
    const closeBtn = document.getElementById("imageViewerClose");
    const prevBtn = document.getElementById("imageViewerPrev");
    const nextBtn = document.getElementById("imageViewerNext");

    if (!modal) return;

    if (e.target === closeBtn) {
      closeImageViewer();
    }

    if (e.target === prevBtn) {
      showPreviousImage();
    }

    if (e.target === nextBtn) {
      showNextImage();
    }

    if (e.target === modal) {
      closeImageViewer();
    }
  });

  document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("imageViewerModal");

    if (!modal || !modal.classList.contains("show")) return;

    if (e.key === "Escape") {
      closeImageViewer();
    }

    if (e.key === "ArrowLeft") {
      showPreviousImage();
    }

    if (e.key === "ArrowRight") {
      showNextImage();
    }
  });
}

function formatMoney(value) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeForJs(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}