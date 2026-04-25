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

    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load accommodations.");
    }

    const rooms = Array.isArray(data) ? data : data.rooms || [];

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
            No available accommodations found right now.
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
        const mapLabel = escapeHtml(room.map_label || "Not set");
        const dayPrice = formatMoney(room.day_price);
        const overnightPrice = formatMoney(room.overnight_price);
        const extendedPrice = formatMoney(room.extended_price);
        const maxCapacity = room.max_capacity || 0;
        const status = capitalize(room.status || "available");
        const daySlotLabel = getExtendedLabel(room.category_name, false);
        const extendedSlotLabel = getExtendedLabel(room.category_name, true);

        return `
          <div class="room-ai-card">
            <div style="position: relative;">
              <img
                src="${imageSrc}"
                alt="${itemName}"
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
                ${categoryName}
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

            <div class="room-ai-content">
              <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px;">
                <h3 style="margin:0;">${itemName}</h3>
              </div>

              <p>${itemDescription}</p>

              <div class="room-price">Best for up to ${maxCapacity} pax</div>

              <div class="room-ai-meta">
                <div><strong>Category</strong><br>${categoryName}</div>
                <div><strong>Max Capacity</strong><br>${maxCapacity} guest(s)</div>
                <div><strong>Morning / Day Tour</strong><br>₱${dayPrice}</div>
                <div><strong>Evening / Overnight</strong><br>₱${overnightPrice}</div>
                <div><strong>${extendedSlotLabel}</strong><br>₱${extendedPrice}</div>
                <div><strong>Map Location</strong><br>${mapLabel}</div>
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
  }
}

function getExtendedLabel(categoryName, isExtended = true) {
  const value = String(categoryName || "").toLowerCase();

  if (!isExtended) return "Day Tour";

  if (value === "room") return "22 Hours";
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