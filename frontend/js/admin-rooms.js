const logoutBtn = document.getElementById("logoutBtn");
const roomForm = document.getElementById("roomForm");
const roomMessage = document.getElementById("roomMessage");
const adminRoomsContainer = document.getElementById("adminRoomsContainer");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const roomIdInput = document.getElementById("roomId");
const roomNameInput = document.getElementById("roomName");
const roomDescriptionInput = document.getElementById("roomDescription");
const roomPriceInput = document.getElementById("roomPrice");
const roomCapacityInput = document.getElementById("roomCapacity");
const roomImageInput = document.getElementById("roomImage");
const roomStatusInput = document.getElementById("roomStatus");

const roomImagePreview = document.getElementById("roomImagePreview");
const imagePreviewText = document.getElementById("imagePreviewText");

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Please login first.");
  window.location.href = "login.html";
}

if (user && user.role !== "admin") {
  alert("Access denied. Admins only.");
  window.location.href = "index.html";
}

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("user");
  localStorage.removeItem("selectedRoom");
  window.location.href = "login.html";
});

function updateImagePreview() {
  const imagePath = roomImageInput.value.trim();

  if (!imagePath) {
    roomImagePreview.style.display = "none";
    roomImagePreview.src = "";
    imagePreviewText.textContent = "No image selected yet.";
    return;
  }

  roomImagePreview.src = imagePath;
  roomImagePreview.style.display = "block";
  imagePreviewText.textContent = "Previewing image...";
}

roomImageInput.addEventListener("input", updateImagePreview);

roomImagePreview.addEventListener("load", () => {
  imagePreviewText.textContent = "Image loaded successfully.";
});

roomImagePreview.addEventListener("error", () => {
  roomImagePreview.style.display = "none";
  imagePreviewText.textContent = "Image could not be loaded. Check the path or URL.";
});

function resetForm() {
  roomForm.reset();
  roomIdInput.value = "";
  formTitle.textContent = "Add New Room";
  cancelEditBtn.style.display = "none";
  roomMessage.textContent = "";
  roomImagePreview.style.display = "none";
  roomImagePreview.src = "";
  imagePreviewText.textContent = "No image selected yet.";
}

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

async function loadRoomsForAdmin() {
  try {
    const response = await fetch("http://localhost:5000/api/rooms");
    const rooms = await response.json();

    if (!response.ok) {
      adminRoomsContainer.innerHTML = "<p>Failed to load rooms.</p>";
      return;
    }

    if (rooms.length === 0) {
      adminRoomsContainer.innerHTML = "<p>No rooms found.</p>";
      return;
    }

    adminRoomsContainer.innerHTML = rooms
      .map(
        (room) => `
          <div class="admin-card">
            <img src="${room.image}" alt="${room.room_name}" class="room-img" />
            <h3>${room.room_name}</h3>
            <p><strong>Description:</strong> ${room.description || "-"}</p>
            <p><strong>Price:</strong> ₱${Number(room.price).toLocaleString()}</p>
            <p><strong>Capacity:</strong> ${room.capacity}</p>
            <p><strong>Status:</strong> 
              <span class="status-badge status-${room.status.toLowerCase()}">
                ${room.status}
              </span>
            </p>

            <div class="admin-actions">
              <button class="btn-primary" onclick='editRoom(${JSON.stringify(room)})'>Edit</button>
              <button class="btn-secondary admin-reject" onclick="deleteRoom(${room.id})">Delete</button>
            </div>
          </div>
        `
      )
      .join("");
  } catch (error) {
    console.error(error);
    adminRoomsContainer.innerHTML = "<p>Something went wrong while loading rooms.</p>";
  }
}

function editRoom(room) {
  roomIdInput.value = room.id;
  roomNameInput.value = room.room_name;
  roomDescriptionInput.value = room.description || "";
  roomPriceInput.value = room.price;
  roomCapacityInput.value = room.capacity;
  roomImageInput.value = room.image;
  roomStatusInput.value = room.status;

  formTitle.textContent = "Edit Room";
  cancelEditBtn.style.display = "block";
  updateImagePreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteRoom(id) {
  const confirmed = confirm("Are you sure you want to delete this room?");
  if (!confirmed) return;

  try {
    const response = await fetch(`http://localhost:5000/api/rooms/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      loadRoomsForAdmin();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Failed to delete room.");
  }
}

roomForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const roomData = {
    room_name: roomNameInput.value,
    description: roomDescriptionInput.value,
    price: roomPriceInput.value,
    capacity: roomCapacityInput.value,
    image: roomImageInput.value,
    status: roomStatusInput.value,
  };

  const roomId = roomIdInput.value;
  const isEdit = !!roomId;

  try {
    const response = await fetch(
      isEdit
        ? `http://localhost:5000/api/rooms/${roomId}`
        : "http://localhost:5000/api/rooms",
      {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      roomMessage.style.color = "green";
      roomMessage.textContent = data.message;
      resetForm();
      loadRoomsForAdmin();
    } else {
      roomMessage.style.color = "red";
      roomMessage.textContent = data.message;
    }
  } catch (error) {
    console.error(error);
    roomMessage.style.color = "red";
    roomMessage.textContent = "Something went wrong. Please try again.";
  }
});

loadRoomsForAdmin();