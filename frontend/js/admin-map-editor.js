const API_BASE = "http://127.0.0.1:5000/api";

let markers = [];
let selectedMarkerId = null;
let isAddMode = false;
let draggedMarkerId = null;

const DEFAULT_MARKERS = [
  { name: "Family Room-B", type: "room", color: "#0ea5e9", info: "Family room area.", x: 31, y: 7, room_id: null },
  { name: "Single Room (Pool Side)", type: "room", color: "#0ea5e9", info: "Room near the pool side.", x: 32, y: 21, room_id: null },
  { name: "Standard Room", type: "room", color: "#0ea5e9", info: "Standard room area.", x: 26, y: 35, room_id: null },
  { name: "Family Room-A", type: "room", color: "#0ea5e9", info: "Family room area.", x: 23, y: 43, room_id: null },
  { name: "Double Room", type: "room", color: "#0ea5e9", info: "Double room area.", x: 14, y: 55, room_id: null },
  { name: "Single Room", type: "room", color: "#0ea5e9", info: "Single room area.", x: 8, y: 78, room_id: null },
  { name: "Pool Pavilion", type: "pavilion", color: "#a855f7", info: "Pavilion near the swimming pool.", x: 62, y: 20, room_id: null },
  { name: "Beach Pavilion", type: "pavilion", color: "#a855f7", info: "Pavilion near the beach area.", x: 42, y: 69, room_id: null },
  { name: "Pool Shade", type: "shade", color: "#22c55e", info: "Shade near the pool.", x: 48, y: 28, room_id: null },
  { name: "Big Shade", type: "shade", color: "#22c55e", info: "Big shade area.", x: 58, y: 46, room_id: null },
  { name: "Small Shade", type: "shade", color: "#22c55e", info: "Small shade area.", x: 58, y: 58, room_id: null },
  { name: "Kubo", type: "kubo", color: "#ef4444", info: "Kubo / nipa hut area.", x: 83, y: 10, room_id: null },
  { name: "Small Nipa Hut", type: "kubo", color: "#ef4444", info: "Small nipa hut near beach side.", x: 72, y: 84, room_id: null },
];

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupLogout();
  setupEvents();
  loadMarkersFromDB();
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
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

function setupEvents() {
  document.getElementById("addMarkerBtn").addEventListener("click", () => {
    isAddMode = true;
    alert("Click on the map where you want to add the marker.");
  });

  document.getElementById("saveLayoutBtn").addEventListener("click", saveMarkersToDB);

  document.getElementById("loadDefaultBtn").addEventListener("click", () => {
    if (!confirm("Load default markers? This will replace current unsaved markers on screen.")) return;

    markers = DEFAULT_MARKERS.map((marker) => ({
      ...marker,
      id: createTempId(),
      isNew: true,
    }));

    selectedMarkerId = markers[0]?.id || null;
    renderMarkers();
    fillFormFromSelectedMarker();
  });

  document.getElementById("clearMarkersBtn").addEventListener("click", async () => {
    if (!confirm("Clear all markers from database?")) return;

    await deleteAllMarkers();
    markers = [];
    selectedMarkerId = null;
    renderMarkers();
    clearForm();
    alert("All markers cleared.");
  });

  document.getElementById("updateMarkerBtn").addEventListener("click", updateSelectedMarker);
  document.getElementById("deleteMarkerBtn").addEventListener("click", deleteSelectedMarker);

  document.getElementById("markerType").addEventListener("change", updateColorByType);

  document.getElementById("markerX").addEventListener("input", updatePositionFromInputs);
  document.getElementById("markerY").addEventListener("input", updatePositionFromInputs);

  const mapWrap = document.getElementById("mapEditorWrap");

  mapWrap.addEventListener("click", (e) => {
    if (!isAddMode) return;

    const position = getPercentPosition(e, mapWrap);

    const newMarker = {
      id: createTempId(),
      isNew: true,
      name: "New Marker",
      type: "room",
      color: "#0ea5e9",
      info: "",
      x: position.x,
      y: position.y,
      room_id: null,
    };

    markers.push(newMarker);
    selectedMarkerId = newMarker.id;
    isAddMode = false;

    renderMarkers();
    fillFormFromSelectedMarker();
  });

  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("mouseup", () => {
    draggedMarkerId = null;
  });
}

async function loadMarkersFromDB() {
  try {
    const response = await fetch(`${API_BASE}/map-markers`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load map markers.");
    }

    markers = Array.isArray(data) ? data : data.markers || [];
    selectedMarkerId = markers[0]?.id || null;

    renderMarkers();
    fillFormFromSelectedMarker();
  } catch (error) {
    console.error("loadMarkersFromDB error:", error);
    alert("Failed to load map markers from database.");
  }
}

async function saveMarkersToDB() {
  try {
    for (const marker of markers) {
      const payload = buildMarkerPayload(marker);

      if (marker.isNew || String(marker.id).startsWith("temp_")) {
        const response = await fetch(`${API_BASE}/map-markers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create marker.");
        }
      } else {
        const response = await fetch(`${API_BASE}/map-markers/${marker.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update marker.");
        }
      }
    }

    alert("Map markers saved to database.");
    await loadMarkersFromDB();
  } catch (error) {
    console.error("saveMarkersToDB error:", error);
    alert(error.message || "Failed to save markers.");
  }
}

function buildMarkerPayload(marker) {
  return {
    name: marker.name || "Unnamed Marker",
    type: marker.type || "room",
    color: marker.color || "#14b8a6",
    info: marker.info || "",
    x: Number(marker.x || 0),
    y: Number(marker.y || 0),
    room_id: marker.room_id || null,
  };
}

async function deleteAllMarkers() {
  for (const marker of markers) {
    if (!marker.isNew && !String(marker.id).startsWith("temp_")) {
      await fetch(`${API_BASE}/map-markers/${marker.id}`, {
        method: "DELETE",
      });
    }
  }
}

function renderMarkers() {
  const layer = document.getElementById("mapMarkersLayer");
  const list = document.getElementById("markerList");

  if (!layer || !list) return;

  layer.innerHTML = markers
    .map((marker) => {
      const activeClass = String(marker.id) === String(selectedMarkerId) ? "active" : "";

      return `
        <button
          type="button"
          class="admin-map-marker ${activeClass}"
          style="left:${Number(marker.x)}%; top:${Number(marker.y)}%; background:${escapeHtml(marker.color || "#14b8a6")};"
          onmousedown="startMarkerDrag(event, '${escapeHtml(marker.id)}')"
          onclick="selectMarker(event, '${escapeHtml(marker.id)}')"
          title="${escapeHtml(marker.name || "Map Marker")}"
        >
          <span class="marker-name-tag">${escapeHtml(marker.name || "Map Marker")}</span>
        </button>
      `;
    })
    .join("");

  list.innerHTML = markers.length
    ? markers
        .map((marker) => {
          const activeClass =
            String(marker.id) === String(selectedMarkerId) ? "active" : "";

          return `
            <div class="marker-list-item ${activeClass}" onclick="selectMarkerFromList('${escapeHtml(marker.id)}')">
              <strong>${escapeHtml(marker.name || "Map Marker")}</strong>
              <span>${escapeHtml(marker.type || "marker")} • X ${Number(marker.x).toFixed(1)}%, Y ${Number(marker.y).toFixed(1)}%</span>
            </div>
          `;
        })
        .join("")
    : `
      <div class="marker-list-item">
        <strong>No markers yet</strong>
        <span>Add a marker to start editing the map.</span>
      </div>
    `;
}

function startMarkerDrag(event, id) {
  event.preventDefault();
  event.stopPropagation();

  draggedMarkerId = id;
  selectedMarkerId = id;

  renderMarkers();
  fillFormFromSelectedMarker();
}

function handleDragMove(e) {
  if (!draggedMarkerId) return;

  const mapWrap = document.getElementById("mapEditorWrap");
  const marker = markers.find((item) => String(item.id) === String(draggedMarkerId));

  if (!mapWrap || !marker) return;

  const position = getPercentPosition(e, mapWrap);

  marker.x = clamp(position.x, 0, 100);
  marker.y = clamp(position.y, 0, 100);

  renderMarkers();
  fillFormFromSelectedMarker();
}

function selectMarker(event, id) {
  event.preventDefault();
  event.stopPropagation();

  selectedMarkerId = id;
  renderMarkers();
  fillFormFromSelectedMarker();
}

function selectMarkerFromList(id) {
  selectedMarkerId = id;
  renderMarkers();
  fillFormFromSelectedMarker();
}

function fillFormFromSelectedMarker() {
  const marker = getSelectedMarker();

  if (!marker) {
    clearForm();
    return;
  }

  document.getElementById("markerName").value = marker.name || "";
  document.getElementById("markerType").value = marker.type || "room";
  document.getElementById("markerColor").value = marker.color || "#14b8a6";
  document.getElementById("markerInfo").value = marker.info || "";
  document.getElementById("markerX").value = Number(marker.x || 0).toFixed(1);
  document.getElementById("markerY").value = Number(marker.y || 0).toFixed(1);
}

function clearForm() {
  document.getElementById("markerName").value = "";
  document.getElementById("markerType").value = "room";
  document.getElementById("markerColor").value = "#14b8a6";
  document.getElementById("markerInfo").value = "";
  document.getElementById("markerX").value = "";
  document.getElementById("markerY").value = "";
}

function updateSelectedMarker() {
  const marker = getSelectedMarker();

  if (!marker) {
    alert("Select a marker first.");
    return;
  }

  marker.name = document.getElementById("markerName").value.trim() || "Unnamed Marker";
  marker.type = document.getElementById("markerType").value;
  marker.color = document.getElementById("markerColor").value;
  marker.info = document.getElementById("markerInfo").value.trim();
  marker.x = Number(document.getElementById("markerX").value || marker.x);
  marker.y = Number(document.getElementById("markerY").value || marker.y);

  renderMarkers();
  fillFormFromSelectedMarker();
}

async function deleteSelectedMarker() {
  const marker = getSelectedMarker();

  if (!marker) {
    alert("Select a marker first.");
    return;
  }

  if (!confirm("Delete selected marker?")) return;

  try {
    if (!marker.isNew && !String(marker.id).startsWith("temp_")) {
      const response = await fetch(`${API_BASE}/map-markers/${marker.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete marker.");
      }
    }

    markers = markers.filter((item) => String(item.id) !== String(marker.id));
    selectedMarkerId = markers[0]?.id || null;

    renderMarkers();
    fillFormFromSelectedMarker();
  } catch (error) {
    console.error("deleteSelectedMarker error:", error);
    alert(error.message || "Failed to delete marker.");
  }
}

function updateColorByType() {
  const type = document.getElementById("markerType").value;
  const colorInput = document.getElementById("markerColor");

  const colors = {
    room: "#0ea5e9",
    shade: "#22c55e",
    pavilion: "#a855f7",
    kubo: "#ef4444",
    service: "#64748b",
  };

  colorInput.value = colors[type] || "#14b8a6";
}

function updatePositionFromInputs() {
  const marker = getSelectedMarker();

  if (!marker) return;

  const x = Number(document.getElementById("markerX").value);
  const y = Number(document.getElementById("markerY").value);

  if (!Number.isNaN(x)) marker.x = clamp(x, 0, 100);
  if (!Number.isNaN(y)) marker.y = clamp(y, 0, 100);

  renderMarkers();
}

function getSelectedMarker() {
  return markers.find((marker) => String(marker.id) === String(selectedMarkerId));
}

function getPercentPosition(event, container) {
  const rect = container.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  };
}

function createTempId() {
  return `temp_${Date.now()}_${Math.floor(Math.random() * 99999)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}