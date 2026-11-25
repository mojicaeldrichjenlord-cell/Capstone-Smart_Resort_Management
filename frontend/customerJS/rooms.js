// ============================================================
// CUSTOMER ROOMS SCRIPT
// File: frontend/customerJS/rooms.js
// Purpose:
// - Check customer access
// - Load accommodations
// - Filter rooms/cottages/function areas
// - Handle image viewer
// - Handle logout
// - Works from frontend/customerHTML/rooms.html
// ============================================================


let allRooms = [];
let currentFilter = "all";
let currentPax = "";
const catalogDetail = document.body.classList.contains("catalog-detail-page");
const catalogQuery = new URLSearchParams(location.search);
const catalogRoomId = Number(catalogQuery.get("room_id"));
function paxDigits(value) { return String(value ?? "").replace(/[^0-9]/g,"").slice(0,4); }
function catalogUrl(page, id) {
  const query = new URLSearchParams();
  if(id) query.set(page === "rooms.html" ? "return_room" : "room_id",String(id));
  if(currentFilter!=="all") query.set("category",currentFilter);
  if(currentPax) query.set("pax",currentPax);
  return page+(query.toString()?"?"+query:"");
}
function syncCatalogFilters() {
  document.querySelectorAll(".category-filter-btn").forEach(btn=>{
    const active=btn.dataset.filter===currentFilter;
    btn.classList.toggle("active",active);
    btn.setAttribute("aria-pressed",String(active));
  });
  const input=document.getElementById("catalogPax");
  if(input) input.value=currentPax;
}
function applyCatalogFilters() {
  syncCatalogFilters();
  history.replaceState(history.state,"",catalogUrl("rooms.html"));
  renderRooms(getFilteredRooms());
}
function renderCatalogPreview(room) {
  const id=Number(room.id);
  if(!Number.isSafeInteger(id)||id<1) return "";
  const name=escapeHtml(room.name||"Accommodation");
  const type=escapeHtml(getGroupLabel(getAccommodationGroup(room.category_name,room.name)));
  const rates=[room.day_price,room.overnight_price,room.extended_price].map(Number).filter(n=>Number.isFinite(n)&&n>0);
  const capacity=Number(room.max_capacity)||0;
  return `<article class="room-ai-card catalog-preview" id="room-card-${id}" data-room-id="${id}">
    <a class="catalog-preview-link" href="${escapeHtml(catalogUrl("accommodation-details.html",id))}" aria-label="View details for ${name}">
      <div class="room-photo-wrap"><img src="${escapeHtml(resolveImagePath(room.image||""))}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src=FALLBACK_IMAGE;" /><span class="catalog-type">${type}</span></div>
      <div class="room-ai-content catalog-preview-content"><h3>${name}</h3><p>${capacity>0?"Up to "+capacity+" pax":"Capacity not listed"}</p>
      <div class="catalog-starting-price">${rates.length?"<small>Starts at</small><strong>₱"+formatMoney(Math.min(...rates))+"</strong>":"Ask for rates"}</div>
      <span class="catalog-view-btn">View Details →</span></div>
    </a></article>`;
}
// UI-43: Compact accommodation accordion for mobile / iPad, including
// touch devices in landscape. Desktop retains the full card presentation.
const ROOMS_ACCORDION_QUERY = "(max-width: 1199px), (pointer: coarse)";
let expandedRoomId = null;

function isCompactRoomLayout() {
  return !catalogDetail && window.matchMedia(ROOMS_ACCORDION_QUERY).matches;
}

function syncRoomAccordionState() {
  const compact = isCompactRoomLayout();
  document.querySelectorAll("#roomsContainer .room-ai-card").forEach((card) => {
    const button = card.querySelector(".room-accordion-toggle");
    const panel = card.querySelector(".room-accordion-panel");
    if (!button || !panel) return;
    const expanded = !compact || Number(card.dataset.roomId) === expandedRoomId;
    panel.hidden = !expanded;
    button.setAttribute("aria-expanded", String(expanded));
    card.classList.toggle("is-expanded", expanded);
  });
}

function setupRoomAccordion() {
  const container = document.getElementById("roomsContainer");
  if (!container) return;
  container.addEventListener("click", (event) => {
    const toggle = event.target.closest(".room-accordion-toggle");
    if (!toggle || !container.contains(toggle) || !isCompactRoomLayout()) return;
    const id = Number(toggle.closest(".room-ai-card")?.dataset.roomId);
    if (!Number.isSafeInteger(id) || id < 1) return;
    expandedRoomId = expandedRoomId === id ? null : id;
    syncRoomAccordionState();
  });
  const media = window.matchMedia(ROOMS_ACCORDION_QUERY);
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", syncRoomAccordionState);
  } else if (typeof media.addListener === "function") {
    media.addListener(syncRoomAccordionState);
  }
}

let currentViewerImages = [];
let currentViewerIndex = 0;
let currentViewerCaption = "Accommodation Photo";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <rect width="1200" height="720" fill="#eef8f7"/>
      <rect x="80" y="80" width="1040" height="560" rx="42" fill="#ffffff" stroke="#cbd5e1" stroke-width="8"/>
      <circle cx="600" cy="310" r="74" fill="#dbeafe"/>
      <path d="M560 345l45-60 35 45 25-30 65 90H500l60-45z" fill="#14b8a6"/>
      <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#334155">
        Image unavailable
      </text>
    </svg>
  `);

// ============================================================
// SECTION 1: Page startup
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  if (!checkCustomerAccess()) return;
  const category=catalogQuery.get("category");
  if(["all","rooms","cottages","function-areas"].includes(category)) currentFilter=category;
  currentPax=paxDigits(catalogQuery.get("pax"));
  if(!catalogDetail && Number.isSafeInteger(catalogRoomId) && catalogRoomId>0) {
    location.replace(catalogUrl("accommodation-details.html",catalogRoomId));
    return;
  }
  setupLogout();
  if(catalogDetail) document.getElementById("catalogBack").href=catalogUrl("rooms.html",catalogRoomId);
  else {
    setupCategoryFilters();
    syncCatalogFilters();
    const input=document.getElementById("catalogPax");
    input?.addEventListener("input",()=>{currentPax=paxDigits(input.value);applyCatalogFilters();});
    document.getElementById("catalogReset")?.addEventListener("click",()=>{currentPax="";currentFilter="all";applyCatalogFilters();});
  }
  setupImageViewerControls();
  loadRooms();
});

// ============================================================
// SECTION 2: Customer access checker
// Redirects admin to admin dashboard and unauthenticated users to login.
// ============================================================

function checkCustomerAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "../authHTML/login.html";
    return false;
  }

  if (user.role === "admin" || user.role === "staff") {
    window.location.href = "../adminHTML/admin.html";
    return false;
  }
  return true;
}

// ============================================================
// SECTION 3: Logout
// Handles desktop and mobile logout.
// ============================================================

function setupLogout() {
  const logoutBtns = [
    document.getElementById("logoutBtn"),
    document.getElementById("mobileLogoutBtn"),
  ].filter(Boolean);

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("user");
      sessionStorage.removeItem("customerToken"); // Clear signed session on confirmed logout.

      if (typeof showToast === "function") {
        showToast("Logged out successfully.", "success");
      } else {
        alert("Logged out successfully.");
      }

      setTimeout(() => {
        window.location.href = "../authHTML/login.html";
      }, 700);
    });
  });
}

// ============================================================
// SECTION 4: Category filters
// ============================================================

function setupCategoryFilters() {
  const filterButtons = document.querySelectorAll(".category-filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter || "all";

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      applyCatalogFilters();
    });
  });
}

// ============================================================
// SECTION 5: Load accommodations from backend
// ============================================================

async function loadRooms() {
  const container = document.getElementById("roomsContainer");
  if (!container) return;

  try {
    container.innerHTML = renderRoomMessage(
      "Loading available accommodations...",
      "#475569",
      "rgba(219,231,239,0.92)"
    );

    updateCategoryCount("Loading...");

    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load accommodations.");
    }

    allRooms = Array.isArray(data) ? data : data.rooms || [];

    if(catalogDetail) {
      const room=allRooms.find(item=>Number(item.id)===catalogRoomId);
      document.getElementById("catalogDetailTitle").textContent=room?.name||"Accommodation Details";
      renderRooms(room?[room]:[]);
    } else {
      renderRooms(getFilteredRooms());
      const card=document.getElementById("room-card-"+Number(catalogQuery.get("return_room")));
      if(card) requestAnimationFrame(()=>card.scrollIntoView({block:"start"}));
    }
  } catch (error) {
    console.error("loadRooms error:", error);

    container.innerHTML = renderRoomMessage(
      "Failed to load accommodations.",
      "#991b1b",
      "#fecaca"
    );

    updateCategoryCount("0 shown");
  }
}

// An AI preview's "View Details" link opens the real catalog and focuses
// the matching accommodation. It does NOT claim the slot is booked/available.
function focusRequestedAiAccommodation() {
  const id = Number(new URLSearchParams(window.location.search).get("room_id"));
  if (!Number.isSafeInteger(id) || id < 1) return;
  const card = document.getElementById("room-card-" + id);
  if (!card) return;
  // A deep-linked AI recommendation must show its information immediately
  // even when the tablet/phone defaults to collapsed accommodations.
  if (isCompactRoomLayout()) {
    expandedRoomId = id;
    syncRoomAccordionState();
  }
  card.classList.add("ai-room-focused");
  window.requestAnimationFrame(() => card.scrollIntoView({
    behavior: "smooth", block: "center",
  }));
}

// ============================================================
// SECTION 6: Filter helpers
// ============================================================

function getFilteredRooms() {
  const categoryRooms=currentFilter==="all"?allRooms:allRooms.filter(room=>getAccommodationGroup(room.category_name,room.name)===currentFilter);
  const pax=Number(currentPax);
  return pax?categoryRooms.filter(room=>Number(room.max_capacity)>=pax).sort((a,b)=>Number(a.max_capacity)-Number(b.max_capacity)):categoryRooms;
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

// ============================================================
// SECTION 7: Render accommodation cards
// ============================================================

function renderRooms(rooms) {
  const container = document.getElementById("roomsContainer");
  if (!container) return;

  updateCategoryCount(`${rooms.length} shown`);

  if (!allRooms.length) {
    container.innerHTML = renderRoomMessage(
      "No available accommodations found right now.",
      "#475569",
      "rgba(219,231,239,0.92)"
    );
    return;
  }

  if (!rooms.length) {
    container.innerHTML = renderRoomMessage(
      catalogDetail ? "This accommodation is unavailable or could not be found." : "No accommodations match your filters. Try a different guest count or type.",
      "#475569",
      "rgba(219,231,239,0.92)"
    );
    return;
  }

  if(!catalogDetail) {
    container.innerHTML=rooms.map(renderCatalogPreview).join("");
    return;
  }
  // If filters removed the open accommodation, don't expand another by mistake.
  if (!rooms.some(room => Number(room.id) === expandedRoomId)) {
    expandedRoomId = null;
  }
  const compact = isCompactRoomLayout();
  container.innerHTML = rooms
    .map((room) => {
      const rawImage = room.image || "";
      const imageSrc = escapeHtml(resolveImagePath(rawImage));
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
      const roomId = Number(room.id);
      const initiallyExpanded = !compact || expandedRoomId === roomId;
      const compactPrices = [
        Number(room.day_price) > 0 ? "Day ₱" + dayPrice : "",
        Number(room.overnight_price) > 0 ? "Night ₱" + overnightPrice : "",
      ].filter(Boolean).join(" · ") || "Ask for rates";

      const galleryImages = Array.isArray(room.gallery_images)
        ? room.gallery_images
        : [];

      const galleryStrip = galleryImages.length
        ? `
          <div class="room-gallery-strip">
            ${galleryImages
              .slice(0, 8)
              .map((img) => {
                const resolvedImage = resolveImagePath(img);

                return `
                  <img
                    src="${escapeHtml(resolvedImage)}"
                    alt="${itemName} photo"
                    onclick="openImageViewerFromRoom(${room.id}, '${escapeForJs(img)}', '${escapeForJs(room.name || "Accommodation")}')"
                    style="cursor:pointer;"
                    onerror="this.onerror=null; this.src=FALLBACK_IMAGE;"
                  />
                `;
              })
              .join("")}
          </div>
        `
        : "";

      return `
        <article class="room-ai-card${initiallyExpanded ? " is-expanded" : ""}"
          id="room-card-${roomId}" data-room-id="${roomId}">
          <button type="button" class="room-accordion-toggle"
            aria-controls="room-panel-${roomId}"
            aria-expanded="${initiallyExpanded}"
            aria-label="View details for ${itemName}">
            <img class="room-accordion-thumb" src="${imageSrc}" alt=""
              loading="lazy"
              onerror="this.onerror=null;this.src=FALLBACK_IMAGE;" />
            <span class="room-accordion-main">
              <span class="room-accordion-name">${itemName}</span>
              <span class="room-accordion-subtitle">Up to ${maxCapacity} guests · ${displayGroup}</span>
              <span class="room-accordion-price">${compactPrices}</span>
            </span>
            <span class="room-accordion-chevron" aria-hidden="true"></span>
          </button>
          <section class="room-accordion-panel" id="room-panel-${roomId}"
            aria-label="${itemName} details" role="region"${initiallyExpanded ? "" : " hidden"}>
          <div class="catalog-detail-media">
          <div class="room-photo-wrap">
            <img
              src="${imageSrc}"
              alt="${itemName}"
              onclick="openImageViewerFromRoom(${room.id}, '${escapeForJs(rawImage)}', '${escapeForJs(room.name || "Accommodation")}')"
              style="cursor:pointer;"
              onerror="this.onerror=null; this.src=FALLBACK_IMAGE;"
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
          <div class="room-customer-inclusions">
            <strong>Amenities / Inclusions</strong>
            ${formatAmenitiesList(room.amenities)}
          </div>
          </div>

          <div class="room-ai-content">
            <p class="catalog-detail-description">${itemDescription}</p>
            <div class="room-price">Best for up to ${maxCapacity} pax</div>
            <div class="catalog-detail-rates">
              <h3>Rates &amp; Schedule</h3>
              ${[
                ["Morning / Day Tour", room.day_price, dayPrice, room.day_start_time, room.day_end_time],
                ["Evening / Overnight", room.overnight_price, overnightPrice, room.overnight_start_time, room.overnight_end_time],
                [extendedSlotLabel, room.extended_price, extendedPrice, room.extended_start_time, room.extended_end_time],
              ].map(([label, raw, price, from, to]) => `<div class="catalog-rate-row"><strong>${escapeHtml(label)}</strong><b>${Number(raw)>0?"₱"+price:"Rate not listed"}</b><small>${escapeHtml(formatTimeRange(from,to))}</small></div>`).join("")}
            </div>
            <div class="room-ai-meta catalog-detail-meta">
              <div><strong>Free Entrance</strong><br>${Number(room.free_entrance_pax) || 0} pax included</div>
              <div><strong>Map Location</strong><br>${mapLabel}</div>
              <div><strong>Category / Type</strong><br>${categoryName} · ${displayGroup}</div>
              <div><strong>Photos</strong><br>${galleryImages.length ? galleryImages.length + " gallery photo(s)" : "Cover photo only"}</div>
            </div>
            <p class="catalog-slot-note">Select your dates and time slot when reserving.</p>
            <div class="room-ai-actions">
              <a href="booking.html?room_id=${room.id}" class="book-now-btn">
                Reserve This
              </a>

              <button
                type="button"
                class="ask-ai-btn"
                onclick="openAiForRoom(${roomId})"
              >
                Ask AI About This
              </button>
            </div>
          </div>
          </section>
        </article>
      `;
    })
    .join("");
  syncRoomAccordionState();
}

// ============================================================
// SECTION 8: Simple message renderer
// ============================================================

function renderRoomMessage(message, textColor, borderColor) {
  return `
    <div style="grid-column: 1 / -1;">
      <div style="
        background: rgba(255,255,255,0.95);
        border: 1px solid ${borderColor};
        border-radius: 24px;
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

function updateCategoryCount(text) {
  const categoryCount = document.getElementById("categoryCount");

  if (categoryCount) {
    categoryCount.textContent = text;
  }
}

// ============================================================
// SECTION 9: Labels and AI helper
// ============================================================

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

function openAiForRoom(roomId) {
  const room = allRooms.find(item => Number(item.id) === Number(roomId));
  if (room && typeof window.askAiAboutAccommodation === "function") {
    window.askAiAboutAccommodation({ id: Number(room.id), name: room.name });
  }
}

// ============================================================
// SECTION 10: Image viewer
// ============================================================

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
    images.push(selectedImage || "");
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
    currentViewerImages[currentViewerIndex] || "";

  image.src = resolveImagePath(currentImage);
  image.onerror = () => {
    image.onerror = null;
    image.src = FALLBACK_IMAGE;
  };

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

// ============================================================
// SECTION 11: Image path resolver
// Fixes image paths because rooms.html is now inside customerHTML.
// ============================================================

function resolveImagePath(value) {
  const imagePath = String(value || "").trim();

  if (!imagePath) {
    return FALLBACK_IMAGE;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  /*
    Local Live Server setup:
    URL usually looks like:
    http://127.0.0.1:5500/frontend/customerHTML/rooms.html

    Because rooms.html is inside frontend/customerHTML,
    local image paths must go back one folder:
    ../images/accommodations/...
  */
  const isLocalLiveServer =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost";

  const isInsideFrontendFolder =
    window.location.pathname.includes("/frontend/");

  const cleanPath = imagePath
    .replace(/^\.\.\//, "")
    .replace(/^\/+/, "");

  if (cleanPath.startsWith("frontend/images/")) {
    const withoutFrontend = cleanPath.replace(/^frontend\//, "");

    if (isLocalLiveServer && isInsideFrontendFolder) {
      return `../${withoutFrontend}`;
    }

    return `/${withoutFrontend}`;
  }

  if (cleanPath.startsWith("images/")) {
    if (isLocalLiveServer && isInsideFrontendFolder) {
      return `../${cleanPath}`;
    }

    return `/${cleanPath}`;
  }

  // Photo bytes are kept in Aiven. Resolve its /api/rooms/media/:id
  // path through the configured backend, not the Vercel/Live Server origin.
  if (/^api\/rooms\/media\/[1-9]\d*$/.test(cleanPath)) {
    return `${API_BASE.replace(/\/api\/?$/, "")}/${cleanPath}`;
  }

  if (cleanPath.startsWith("uploads/")) {
    return `${API_BASE.replace("/api", "")}/${cleanPath}`;
  }

  if (isLocalLiveServer && isInsideFrontendFolder) {
    return `../${cleanPath}`;
  }

  return `/${cleanPath}`;
}


// ============================================================
// SECTION 11A: Amenities formatter
// Converts multiline amenities/inclusions into a clean customer bullet list.
// ============================================================

function formatAmenitiesList(value) {
  const items = String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) {
    return `<p class="empty-customer-inclusions">No amenities or inclusions listed.</p>`;
  }

  return `
    <ul class="customer-amenities-list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

// ============================================================
// SECTION 12: Format and escape helpers
// ============================================================

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