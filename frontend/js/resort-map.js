const API_BASE = "http://127.0.0.1:5000/api";

let accommodations = [];
let mapMarkers = [];
let selectedMarkerId = null;
let currentMapFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  setupLogout();
  setupMapControls();
  loadCustomerMap();
});

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

function setupMapControls() {
  const filterButtons = document.querySelectorAll(".map-filter-btn");
  const prevBtn = document.getElementById("prevMarkerBtn");
  const nextBtn = document.getElementById("nextMarkerBtn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentMapFilter = button.dataset.filter || "all";

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filteredMarkers = getFilteredMarkers();
      selectedMarkerId = filteredMarkers[0]?.id || null;

      renderMarkers();

      if (selectedMarkerId) {
        selectMarker(selectedMarkerId);
      } else {
        renderNoFilteredMarkersMessage();
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", showPreviousMarker);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", showNextMarker);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      showPreviousMarker();
    }

    if (e.key === "ArrowRight") {
      showNextMarker();
    }
  });
}

async function loadCustomerMap() {
  try {
    const markerResponse = await fetch(`${API_BASE}/map-markers`);
    const markerData = await markerResponse.json();

    if (!markerResponse.ok) {
      throw new Error(markerData.message || "Failed to load map markers.");
    }

    mapMarkers = Array.isArray(markerData) ? markerData : markerData.markers || [];

    const roomResponse = await fetch(`${API_BASE}/rooms`);
    const roomData = await roomResponse.json();

    if (!roomResponse.ok) {
      throw new Error(roomData.message || "Failed to load accommodations.");
    }

    accommodations = Array.isArray(roomData) ? roomData : roomData.rooms || [];

    if (!mapMarkers.length) {
      renderNoMarkersMessage();
      return;
    }

    const filteredMarkers = getFilteredMarkers();
    selectedMarkerId = filteredMarkers[0]?.id || null;

    renderMarkers();

    if (selectedMarkerId) {
      selectMarker(selectedMarkerId);
    } else {
      renderNoFilteredMarkersMessage();
    }
  } catch (error) {
    console.error("loadCustomerMap error:", error);
    renderFallbackMessage();
  }
}

function getFilteredMarkers() {
  if (currentMapFilter === "all") return mapMarkers;

  return mapMarkers.filter((marker) => {
    const linkedAccommodation = findAccommodationForMarker(marker);
    const group = getMarkerGroup(marker, linkedAccommodation);

    return group === currentMapFilter;
  });
}

function getMarkerGroup(marker, room = null) {
  const text = [
    marker?.name,
    marker?.type,
    marker?.info,
    room?.name,
    room?.room_name,
    room?.category_name,
    room?.map_label,
  ]
    .join(" ")
    .toLowerCase();

  if (
    text.includes("function") ||
    text.includes("pavilion") ||
    text.includes("pavillion") ||
    text.includes("event") ||
    text.includes("hall")
  ) {
    return "function-areas";
  }

  if (
    text.includes("room") ||
    text.includes("villa") ||
    text.includes("suite") ||
    text.includes("hotel")
  ) {
    return "rooms";
  }

  if (
    text.includes("cottage") ||
    text.includes("shade") ||
    text.includes("kubo") ||
    text.includes("nipa") ||
    text.includes("hut") ||
    text.includes("cabana")
  ) {
    return "cottages";
  }

  return "cottages";
}

function renderMarkers() {
  const markersContainer = document.getElementById("mapMarkers");
  if (!markersContainer) return;

  const filteredMarkers = getFilteredMarkers();

  updateMapFilterCount(filteredMarkers.length);
  updateNavigationState(filteredMarkers);

  markersContainer.innerHTML = filteredMarkers
    .map((marker) => {
      const isSelected = String(marker.id) === String(selectedMarkerId);

      return `
        <button
          type="button"
          class="map-marker ${isSelected ? "active" : ""}"
          style="left:${Number(marker.x)}%; top:${Number(marker.y)}%; background:${escapeHtml(marker.color || "#14b8a6")};"
          title="${escapeHtml(marker.name || "Map Marker")}"
          onclick="selectMarker('${escapeHtml(marker.id)}')"
        >
          <span class="marker-tooltip">
            ${escapeHtml(marker.name || "Map Marker")}
          </span>
        </button>
      `;
    })
    .join("");
}

function selectMarker(markerId) {
  selectedMarkerId = markerId;

  const marker = mapMarkers.find((item) => String(item.id) === String(markerId));
  if (!marker) return;

  renderMarkers();

  const linkedAccommodation = findAccommodationForMarker(marker);

  if (linkedAccommodation) {
    showAccommodationDetails(linkedAccommodation, marker);
  } else {
    showMarkerOnlyDetails(marker);
  }

  updateSelectedCounter();
}

function showPreviousMarker() {
  const filteredMarkers = getFilteredMarkers();
  if (!filteredMarkers.length) return;

  const currentIndex = filteredMarkers.findIndex(
    (marker) => String(marker.id) === String(selectedMarkerId)
  );

  const previousIndex =
    currentIndex <= 0 ? filteredMarkers.length - 1 : currentIndex - 1;

  selectMarker(filteredMarkers[previousIndex].id);
}

function showNextMarker() {
  const filteredMarkers = getFilteredMarkers();
  if (!filteredMarkers.length) return;

  const currentIndex = filteredMarkers.findIndex(
    (marker) => String(marker.id) === String(selectedMarkerId)
  );

  const nextIndex =
    currentIndex < 0 || currentIndex >= filteredMarkers.length - 1
      ? 0
      : currentIndex + 1;

  selectMarker(filteredMarkers[nextIndex].id);
}

function updateMapFilterCount(count) {
  const countEl = document.getElementById("mapFilterCount");
  if (!countEl) return;

  const label = getFilterLabel(currentMapFilter);
  countEl.textContent = `${count} ${label} marker${count === 1 ? "" : "s"}`;
}

function updateSelectedCounter() {
  const counter = document.getElementById("mapSelectedCounter");
  if (!counter) return;

  const filteredMarkers = getFilteredMarkers();

  if (!filteredMarkers.length || !selectedMarkerId) {
    counter.textContent = "No marker selected";
    return;
  }

  const currentIndex = filteredMarkers.findIndex(
    (marker) => String(marker.id) === String(selectedMarkerId)
  );

  counter.textContent = `${currentIndex + 1} of ${filteredMarkers.length}`;
}

function updateNavigationState(filteredMarkers = getFilteredMarkers()) {
  const prevBtn = document.getElementById("prevMarkerBtn");
  const nextBtn = document.getElementById("nextMarkerBtn");

  const disabled = filteredMarkers.length <= 1;

  if (prevBtn) {
    prevBtn.disabled = filteredMarkers.length === 0;
  }

  if (nextBtn) {
    nextBtn.disabled = filteredMarkers.length === 0;
  }

  if (disabled) {
    updateSelectedCounter();
  }
}

function getFilterLabel(filter) {
  if (filter === "rooms") return "room";
  if (filter === "cottages") return "cottage";
  if (filter === "function-areas") return "function area";
  return "map";
}

function findAccommodationForMarker(marker) {
  const linkedId = marker.room_id || marker.accommodation_id;

  if (linkedId) {
    const roomById = accommodations.find(
      (room) => String(room.id) === String(linkedId)
    );

    if (roomById) return roomById;
  }

  const markerName = normalizeText(marker.name);

  if (!markerName) return null;

  const exactMatch = accommodations.find((room) => {
    const roomName = normalizeText(room.name || room.room_name);
    const mapLabel = normalizeText(room.map_label);

    return roomName === markerName || mapLabel === markerName;
  });

  if (exactMatch) return exactMatch;

  return null;
}

function showAccommodationDetails(room, marker) {
  const status = String(room.status || "available").toLowerCase();
  const isAvailable = status === "available";

  setImage("infoImage", room.image || "images/no-image.jpg");
  setText("infoName", room.name || room.room_name || marker.name || "Accommodation");
  setText(
    "infoDescription",
    room.description || marker.info || "No description available."
  );
  setText("infoLocation", room.map_label || marker.info || "Not set");
  setText("infoCategory", room.category_name || formatMarkerType(marker.type));
  setText("infoCapacity", `${room.max_capacity || room.capacity || 0} pax`);
  setText("infoDayPrice", `₱${formatMoney(room.day_price || room.price)}`);
  setText("infoOvernightPrice", `₱${formatMoney(room.overnight_price || room.price)}`);
  setText("infoExtendedPrice", `₱${formatMoney(room.extended_price)}`);

  setStatus(isAvailable ? "Available" : "Unavailable", isAvailable);

  const bookBtn = document.getElementById("mapBookBtn");

  if (bookBtn && room.id) {
    bookBtn.style.display = "inline-flex";
    bookBtn.href = `booking.html?room_id=${Number(room.id)}&roomId=${Number(room.id)}`;
  } else {
    hideBookButton();
  }
}

function showMarkerOnlyDetails(marker) {
  setImage("infoImage", "images/no-image.jpg");
  setText("infoName", marker.name || "Map Marker");
  setText(
    "infoDescription",
    marker.info || "This marker shows a location inside the resort."
  );
  setText("infoLocation", marker.info || "Map location");
  setText("infoCategory", formatMarkerType(marker.type));
  setText("infoCapacity", "-");
  setText("infoDayPrice", "-");
  setText("infoOvernightPrice", "-");
  setText("infoExtendedPrice", "-");

  setStatus("Map Guide", true);
  hideBookButton();
}

function renderNoFilteredMarkersMessage() {
  const markersContainer = document.getElementById("mapMarkers");

  if (markersContainer) {
    markersContainer.innerHTML = "";
  }

  updateMapFilterCount(0);

  setImage("infoImage", "images/no-image.jpg");
  setText("infoName", `No ${getFilterLabel(currentMapFilter)} markers found`);
  setText(
    "infoDescription",
    "Try selecting All, or ask the admin to link markers to accommodations in the Map Editor."
  );
  setText("infoLocation", "-");
  setText("infoCategory", "-");
  setText("infoCapacity", "-");
  setText("infoDayPrice", "-");
  setText("infoOvernightPrice", "-");
  setText("infoExtendedPrice", "-");
  setStatus("-", true);
  hideBookButton();
  updateSelectedCounter();
}

function renderNoMarkersMessage() {
  const markersContainer = document.getElementById("mapMarkers");

  if (markersContainer) {
    markersContainer.innerHTML = "";
  }

  updateMapFilterCount(0);

  setImage("infoImage", "images/no-image.jpg");
  setText("infoName", "No map markers yet");
  setText(
    "infoDescription",
    "Please add and save markers from the Admin Map Editor first."
  );
  setText("infoLocation", "-");
  setText("infoCategory", "-");
  setText("infoCapacity", "-");
  setText("infoDayPrice", "-");
  setText("infoOvernightPrice", "-");
  setText("infoExtendedPrice", "-");
  setStatus("-", true);
  hideBookButton();
  updateSelectedCounter();
}

function renderFallbackMessage() {
  const markersContainer = document.getElementById("mapMarkers");

  if (markersContainer) {
    markersContainer.innerHTML = "";
  }

  updateMapFilterCount(0);

  setImage("infoImage", "images/no-image.jpg");
  setText("infoName", "Map details unavailable");
  setText(
    "infoDescription",
    "The map image is still visible, but marker data could not be loaded."
  );
  setText("infoLocation", "-");
  setText("infoCategory", "-");
  setText("infoCapacity", "-");
  setText("infoDayPrice", "-");
  setText("infoOvernightPrice", "-");
  setText("infoExtendedPrice", "-");
  setStatus("-", true);
  hideBookButton();
  updateSelectedCounter();
}

function hideBookButton() {
  const bookBtn = document.getElementById("mapBookBtn");

  if (bookBtn) {
    bookBtn.style.display = "none";
    bookBtn.href = "#";
  }
}

function setStatus(label, isAvailableStyle) {
  const statusEl = document.getElementById("infoStatus");

  if (!statusEl) return;

  statusEl.innerHTML = `
    <span class="status-pill ${
      isAvailableStyle ? "status-available-pill" : "status-unavailable-pill"
    }">
      ${escapeHtml(label)}
    </span>
  `;
}

function formatMarkerType(type) {
  const value = String(type || "").toLowerCase();

  if (value === "room") return "Room";
  if (value === "shade") return "Shade / Cottage";
  if (value === "pavilion") return "Function Area / Pavilion";
  if (value === "kubo") return "Kubo / Nipa Hut";
  if (value === "service") return "Service Area";

  return "Map Marker";
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function setText(id, value) {
  const el = document.getElementById(id);

  if (el) {
    el.textContent = value;
  }
}

function setImage(id, src) {
  const img = document.getElementById(id);

  if (!img) return;

  img.src = src || "images/no-image.jpg";

  img.onerror = () => {
    img.src = "images/no-image.jpg";
  };
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}