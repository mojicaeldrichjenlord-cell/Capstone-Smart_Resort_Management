const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");

const selectedRoom = JSON.parse(localStorage.getItem("selectedRoom"));
const user = JSON.parse(localStorage.getItem("user"));

const roomNameInput = document.getElementById("roomName");
const roomPriceInput = document.getElementById("roomPrice");
const roomCapacityInput = document.getElementById("roomCapacity");
const checkInInput = document.getElementById("checkIn");
const checkOutInput = document.getElementById("checkOut");
const guestsInput = document.getElementById("guests");
const totalNightsText = document.getElementById("totalNights");
const estimatedTotalText = document.getElementById("estimatedTotal");

if (!user) {
  alert("Please login first.");
  window.location.href = "login.html";
}

if (!selectedRoom) {
  alert("Please select a room first.");
  window.location.href = "rooms.html";
}

if (selectedRoom) {
  roomNameInput.textContent = selectedRoom.name;
  roomPriceInput.textContent = `₱${Number(selectedRoom.price).toLocaleString()}`;
  roomCapacityInput.textContent = selectedRoom.capacity;
  guestsInput.max = selectedRoom.capacity;
}

function formatDateForInput(date) {
  return date.toISOString().split("T")[0];
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDateForInput(date);
}

function setMinimumDates() {
  const today = new Date();
  const todayString = formatDateForInput(today);

  checkInInput.min = todayString;

  if (!checkInInput.value) {
    checkInInput.value = todayString;
  }

  const minimumCheckOut = addDays(checkInInput.value, 1);
  checkOutInput.min = minimumCheckOut;

  if (!checkOutInput.value || checkOutInput.value <= checkInInput.value) {
    checkOutInput.value = minimumCheckOut;
  }
}

function calculateSummary() {
  const checkIn = checkInInput.value;
  const checkOut = checkOutInput.value;
  const price = Number(selectedRoom.price || 0);

  if (!checkIn || !checkOut) {
    totalNightsText.textContent = "0";
    estimatedTotalText.textContent = "₱0";
    return;
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  const timeDifference = endDate - startDate;
  const nights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    totalNightsText.textContent = "0";
    estimatedTotalText.textContent = "₱0";
    return;
  }

  const total = nights * price;

  totalNightsText.textContent = nights;
  estimatedTotalText.textContent = `₱${total.toLocaleString()}`;
}

function updateCheckOutRules() {
  if (!checkInInput.value) return;

  const minimumCheckOut = addDays(checkInInput.value, 1);
  checkOutInput.min = minimumCheckOut;

  if (!checkOutInput.value || checkOutInput.value <= checkInInput.value) {
    checkOutInput.value = minimumCheckOut;
  }

  calculateSummary();
}

checkInInput.addEventListener("input", updateCheckOutRules);
checkOutInput.addEventListener("input", calculateSummary);

guestsInput.addEventListener("input", () => {
  const maxCapacity = Number(selectedRoom.capacity);

  if (Number(guestsInput.value) > maxCapacity) {
    guestsInput.value = maxCapacity;
    bookingMessage.style.color = "red";
    bookingMessage.textContent = `Maximum guests allowed for this room is ${maxCapacity}.`;
  } else {
    bookingMessage.textContent = "";
  }
});

setMinimumDates();
calculateSummary();

bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const check_in = checkInInput.value;
  const check_out = checkOutInput.value;
  const guests = Number(guestsInput.value);
  const maxCapacity = Number(selectedRoom.capacity);

  const today = formatDateForInput(new Date());
  const minimumCheckOut = addDays(check_in, 1);

  if (!check_in || !check_out || !guests) {
    bookingMessage.style.color = "red";
    bookingMessage.textContent = "Please fill in all fields.";
    return;
  }

  if (check_in < today) {
    bookingMessage.style.color = "red";
    bookingMessage.textContent = "Check-in date cannot be in the past.";
    return;
  }

  if (check_out < minimumCheckOut) {
    bookingMessage.style.color = "red";
    bookingMessage.textContent =
      "Check-out date must be at least one day after check-in.";
    return;
  }

  if (guests > maxCapacity) {
    bookingMessage.style.color = "red";
    bookingMessage.textContent = `This room can only accommodate up to ${maxCapacity} guests.`;
    return;
  }

  const bookingData = {
    user_id: user.id,
    room_id: selectedRoom.id,
    check_in,
    check_out,
    guests,
  };

  try {
    const response = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.removeItem("selectedRoom");
      window.location.href = "my-bookings.html";
    } else {
      bookingMessage.style.color = "red";
      bookingMessage.textContent = data.message;
    }
  } catch (error) {
    bookingMessage.style.color = "red";
    bookingMessage.textContent = "Something went wrong. Please try again.";
    console.error(error);
  }
});