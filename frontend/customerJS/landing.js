/* ======================================================
   PUBLIC LANDING PAGE JAVASCRIPT
   File: frontend/customerJS/landing.js
   Purpose:
   - Controls mobile burger menu
   - Controls clickable Resort Showcase modal
   - Supports image galleries and drone MP4 video
   - Supports next, previous, close, and keyboard controls
====================================================== */

/* ======================================================
   MOBILE NAVBAR MENU
   Purpose:
   - Opens and closes navbar links on mobile
   - Changes burger icon from ☰ to ×
====================================================== */

const landingMenuToggle = document.getElementById("landingMenuToggle");
const landingNavLinks = document.getElementById("landingNavLinks");

if (landingMenuToggle && landingNavLinks) {
  landingMenuToggle.addEventListener("click", () => {
    landingNavLinks.classList.toggle("show");

    const isMenuOpen = landingNavLinks.classList.contains("show");

    landingMenuToggle.textContent = isMenuOpen ? "×" : "☰";
    landingMenuToggle.setAttribute(
      "aria-label",
      isMenuOpen ? "Close navigation menu" : "Open navigation menu",
    );
  });
}

/* ======================================================
   CLOSE MOBILE NAV WHEN NAV LINK IS CLICKED
   Purpose:
   - Improves mobile user experience
   - Automatically closes menu after selecting a section
====================================================== */

if (landingNavLinks && landingMenuToggle) {
  const navLinks = landingNavLinks.querySelectorAll("a");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      landingNavLinks.classList.remove("show");
      landingMenuToggle.textContent = "☰";
      landingMenuToggle.setAttribute("aria-label", "Open navigation menu");
    });
  });
}

/* ======================================================
   MODAL ELEMENT REFERENCES
   Purpose:
   - Gets all modal elements from landing.html
====================================================== */

const galleryCards = document.querySelectorAll(".js-gallery-card");
const galleryModal = document.getElementById("galleryModal");
const galleryImage = document.getElementById("galleryImage");
const galleryVideo = document.getElementById("galleryVideo");
const galleryVideoSource = document.getElementById("galleryVideoSource");
const galleryTitle = document.getElementById("galleryTitle");
const galleryDescription = document.getElementById("galleryDescription");
const galleryCounter = document.getElementById("galleryCounter");
const galleryCloseBtn = document.getElementById("galleryCloseBtn");
const galleryPrevBtn = document.getElementById("galleryPrevBtn");
const galleryNextBtn = document.getElementById("galleryNextBtn");
const galleryCloseAreas = document.querySelectorAll("[data-gallery-close]");

/* ======================================================
   MODAL STATE
   Purpose:
   - Stores the selected media type
   - Stores the images of the clicked showcase only
   - Tracks the current image index inside that selected showcase
====================================================== */

let currentGalleryType = "image";
let currentGalleryImages = [];
let currentGalleryIndex = 0;

/* ======================================================
   OPEN MODAL
   Purpose:
   - Opens modal when a showcase card is clicked
   - If card is video type, opens MP4 drone video
   - If card is image type, opens image gallery for that category only
====================================================== */

function openGallery(card) {
  if (!card || !galleryModal) return;

  const title = card.dataset.galleryTitle || "Resort Gallery";
  const description =
    card.dataset.galleryDescription ||
    "View more photos of Arvic Seaside Beach Resort and Hotel.";

  currentGalleryType = card.dataset.galleryType || "image";

  galleryTitle.textContent = title;
  galleryDescription.textContent = description;

  if (currentGalleryType === "video") {
    openVideoGallery(card);
  } else {
    openImageGallery(card);
  }

  galleryModal.classList.add("show");
  galleryModal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

/* ======================================================
   OPEN VIDEO GALLERY
   Purpose:
   - Shows the drone MP4 video inside modal
   - Hides image viewer and next/previous buttons
====================================================== */

function openVideoGallery(card) {
  if (!galleryVideo || !galleryVideoSource || !galleryImage) return;

  const videoPath = card.dataset.galleryVideo || "";

  if (!videoPath) return;

  currentGalleryImages = [];
  currentGalleryIndex = 0;

  galleryImage.style.display = "none";

  galleryVideo.style.display = "block";
  galleryVideoSource.src = videoPath;
  galleryVideo.load();

  galleryPrevBtn.style.display = "none";
  galleryNextBtn.style.display = "none";

  galleryCounter.textContent = "Video";
}

/* ======================================================
   OPEN IMAGE GALLERY
   Purpose:
   - Shows selected image gallery inside modal
   - Keeps gallery images limited to clicked showcase category
====================================================== */

function openImageGallery(card) {
  if (!galleryImage || !galleryVideo) return;

  const imageData = card.dataset.galleryImages || "";

  currentGalleryImages = imageData
    .split("|")
    .map((imagePath) => imagePath.trim())
    .filter((imagePath) => imagePath.length > 0);

  if (currentGalleryImages.length === 0) return;

  currentGalleryIndex = 0;

  galleryVideo.pause();
  galleryVideo.style.display = "none";
  galleryVideoSource.src = "";

  galleryImage.style.display = "block";

  updateGalleryImage();
}

/* ======================================================
   CLOSE MODAL
   Purpose:
   - Closes modal
   - Stops drone video if playing
   - Restores page scrolling
====================================================== */

function closeGallery() {
  if (!galleryModal) return;

  galleryModal.classList.remove("show");
  galleryModal.setAttribute("aria-hidden", "true");

  if (galleryVideo) {
    galleryVideo.pause();
    galleryVideo.currentTime = 0;
  }

  document.body.style.overflow = "";
}

/* ======================================================
   UPDATE GALLERY IMAGE
   Purpose:
   - Displays the current image from the selected showcase
   - Updates image counter
   - Hides next/previous buttons when only one image exists
====================================================== */

function updateGalleryImage() {
  if (!galleryImage || currentGalleryImages.length === 0) return;

  const currentImagePath = currentGalleryImages[currentGalleryIndex];

  galleryImage.src = currentImagePath;
  galleryImage.alt = `${galleryTitle.textContent} photo ${currentGalleryIndex + 1}`;

  galleryCounter.textContent = `${currentGalleryIndex + 1} / ${
    currentGalleryImages.length
  }`;

  const hasMultipleImages = currentGalleryImages.length > 1;

  galleryPrevBtn.style.display = hasMultipleImages ? "block" : "none";
  galleryNextBtn.style.display = hasMultipleImages ? "block" : "none";
}

/* ======================================================
   SHOW NEXT IMAGE
   Purpose:
   - Moves gallery to next image inside the selected showcase only
   - Does not run for drone video
====================================================== */

function showNextImage() {
  if (currentGalleryType === "video") return;
  if (currentGalleryImages.length <= 1) return;

  currentGalleryIndex =
    (currentGalleryIndex + 1) % currentGalleryImages.length;

  updateGalleryImage();
}

/* ======================================================
   SHOW PREVIOUS IMAGE
   Purpose:
   - Moves gallery to previous image inside the selected showcase only
   - Does not run for drone video
====================================================== */

function showPreviousImage() {
  if (currentGalleryType === "video") return;
  if (currentGalleryImages.length <= 1) return;

  currentGalleryIndex =
    (currentGalleryIndex - 1 + currentGalleryImages.length) %
    currentGalleryImages.length;

  updateGalleryImage();
}

/* ======================================================
   SHOWCASE CARD CLICK EVENTS
   Purpose:
   - Opens modal when card is clicked
====================================================== */

galleryCards.forEach((card) => {
  card.addEventListener("click", () => {
    openGallery(card);
  });
});

/* ======================================================
   SHOWCASE CARD KEYBOARD EVENTS
   Purpose:
   - Allows Enter or Space key to open modal
   - Improves accessibility
====================================================== */

galleryCards.forEach((card) => {
  card.addEventListener("keydown", (event) => {
    const isEnterKey = event.key === "Enter";
    const isSpaceKey = event.key === " ";

    if (isEnterKey || isSpaceKey) {
      event.preventDefault();
      openGallery(card);
    }
  });
});

/* ======================================================
   MODAL BUTTON EVENTS
   Purpose:
   - Connects close, next, and previous buttons
====================================================== */

if (galleryCloseBtn) {
  galleryCloseBtn.addEventListener("click", closeGallery);
}

if (galleryNextBtn) {
  galleryNextBtn.addEventListener("click", showNextImage);
}

if (galleryPrevBtn) {
  galleryPrevBtn.addEventListener("click", showPreviousImage);
}

/* ======================================================
   BACKDROP CLOSE EVENT
   Purpose:
   - Allows closing modal by clicking outside the media
====================================================== */

galleryCloseAreas.forEach((area) => {
  area.addEventListener("click", closeGallery);
});

/* ======================================================
   KEYBOARD CONTROLS
   Purpose:
   - Escape closes modal
   - ArrowRight shows next image only for image galleries
   - ArrowLeft shows previous image only for image galleries
====================================================== */

document.addEventListener("keydown", (event) => {
  const isGalleryOpen =
    galleryModal && galleryModal.classList.contains("show");

  if (!isGalleryOpen) return;

  if (event.key === "Escape") {
    closeGallery();
  }

  if (event.key === "ArrowRight") {
    showNextImage();
  }

  if (event.key === "ArrowLeft") {
    showPreviousImage();
  }
});
