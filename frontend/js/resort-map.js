const API_BASE = "http://127.0.0.1:5000/api";

let accommodations = [];
let mapMarkers = [];
let selectedMarkerId = null;

document.addEventListener("DOMContentLoaded", () => {
  setupLogout();
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

    renderMarkers();
    selectMarker(mapMarkers[0].id);
  } catch (error) {
    console.error("loadCustomerMap error:", error);
    renderFallbackMessage();
  }
}

function renderMarkers() {
  const markersContainer = document.getElementById("mapMarkers");
  if (!markersContainer) return;

  markersContainer.innerHTML = mapMarkers
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
}

function findAccommodationForMarker(marker) {
  if (marker.room_id) {
    const roomById = accommodations.find(
      (room) => String(room.id) === String(marker.room_id)
    );

    if (roomById) return roomById;
  }

  const markerName = normalizeText(marker.name);

  if (!markerName) return null;

  return accommodations.find((room) => {
    const roomName = normalizeText(room.name);
    const mapLabel = normalizeText(room.map_label);
    const category = normalizeText(room.category_name);

    return (
      roomName === markerName ||
      roomName.includes(markerName) ||
      markerName.includes(roomName) ||
      mapLabel.includes(markerName) ||
      markerName.includes(mapLabel) ||
      category.includes(markerName)
    );
  });
}

function showAccommodationDetails(room, marker) {
  const status = String(room.status || "available").toLowerCase();
  const isAvailable = status === "available";

  setImage("infoImage", room.image || "images/no-image.jpg");
  setText("infoName", room.name || marker.name || "Accommodation");
  setText(
    "infoDescription",
    room.description || marker.info || "No description available."
  );
  setText("infoLocation", room.map_label || marker.info || "Not set");
  setText("infoCategory", room.category_name || marker.type || "N/A");
  setText("infoCapacity", `${room.max_capacity || 0} pax`);
  setText("infoDayPrice", `₱${formatMoney(room.day_price)}`);
  setText("infoOvernightPrice", `₱${formatMoney(room.overnight_price)}`);
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

function renderNoMarkersMessage() {
  const markersContainer = document.getElementById("mapMarkers");

  if (markersContainer) {
    markersContainer.innerHTML = "";
  }

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
}

function renderFallbackMessage() {
  const markersContainer = document.getElementById("mapMarkers");

  if (markersContainer) {
    markersContainer.innerHTML = "";
  }

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
  if (value === "shade") return "Shade";
  if (value === "pavilion") return "Pavilion";
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