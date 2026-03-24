const roomsContainer = document.getElementById("roomsContainer");
const user = JSON.parse(localStorage.getItem("user"));

const loginNav = document.getElementById("loginNav");
const registerNav = document.getElementById("registerNav");
const logoutBtn = document.getElementById("logoutBtn");

if (user) {
  loginNav.style.display = "none";
  registerNav.style.display = "none";
  logoutBtn.style.display = "inline-block";
}

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("user");
  localStorage.removeItem("selectedRoom");
  window.location.href = "index.html";
});

async function loadRooms() {
  try {
    const response = await fetch("http://localhost:5000/api/rooms");
    const rooms = await response.json();

    if (!response.ok) {
      roomsContainer.innerHTML = "<p>Failed to load rooms.</p>";
      return;
    }

    if (rooms.length === 0) {
      roomsContainer.innerHTML = "<p>No rooms available.</p>";
      return;
    }

    roomsContainer.innerHTML = rooms
      .map(
        (room) => `
        <div class="room-card">
          <img src="${room.image}" alt="${room.room_name}" class="room-img" />
          <div class="room-content">
            <h3>${room.room_name}</h3>
            <p>${room.description ?? ""}</p>
            <p><strong>Capacity:</strong> ${room.capacity}</p>
            <p><strong>Price:</strong> ₱${Number(room.price).toLocaleString()}</p>
            <p><strong>Status:</strong> ${room.status}</p>
            <button
              class="btn-primary"
              onclick="bookRoom(${room.id}, '${String(room.room_name).replace(/'/g, "\\'")}', ${room.price}, ${room.capacity})"
              ${room.status !== "available" ? "disabled" : ""}
            >
              ${room.status === "available" ? "Book Now" : "Unavailable"}
            </button>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error(error);
    roomsContainer.innerHTML = "<p>Something went wrong while loading rooms.</p>";
  }
}

function bookRoom(id, name, price, capacity) {
  if (!user) {
    alert("Please login or register first before booking.");
    window.location.href = "login.html";
    return;
  }

  localStorage.setItem(
    "selectedRoom",
    JSON.stringify({ id, name, price, capacity })
  );
  window.location.href = "booking.html";
}

loadRooms();