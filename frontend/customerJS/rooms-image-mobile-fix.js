// ============================================================
// ACCOMMODATION IMAGE MOBILE / VERCEL COMPATIBILITY FIX V3
// File: frontend/customerJS/rooms-image-mobile-fix.js
//
// Purpose:
// - Keep existing rooms.js untouched.
// - Preserve the working generic case-sensitive image fix.
// - Add one targeted canonical path fix for Beach Pavillion.
// - Fix cover images, gallery thumbnails, and image viewer.
//
// Confirmed Beach Pavillion mismatch:
// API / database style:
//   images/accommodations/function-area/Beach-pavillion.jpg
//
// Actual deployed repository file:
//   images/accommodations/Function-Area/Beach-Pavillion.jpg
//
// Vercel/Linux is case-sensitive, so folder + filename case must match.
// ============================================================

(function () {
  "use strict";

  // ==========================================================
  // SECTION 1: FALLBACK IMAGE
  // ==========================================================

  const MOBILE_IMAGE_FALLBACK =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg"
           width="1200"
           height="720"
           viewBox="0 0 1200 720">
        <rect width="1200" height="720" fill="#eef8f7"/>
        <rect x="80"
              y="80"
              width="1040"
              height="560"
              rx="42"
              fill="#ffffff"
              stroke="#cbd5e1"
              stroke-width="8"/>
        <circle cx="600" cy="300" r="74" fill="#dbeafe"/>
        <path d="M560 340l45-60 35 45 25-30 65 90H500l60-45z"
              fill="#14b8a6"/>
        <text x="600"
              y="475"
              text-anchor="middle"
              font-family="Arial, sans-serif"
              font-size="38"
              font-weight="700"
              fill="#334155">
          Image unavailable
        </text>
      </svg>
    `);

  // ==========================================================
  // SECTION 2: NORMALIZE DATABASE PATH
  // ==========================================================

  function normalizeStaticImagePath(value) {
    let path = String(value || "").trim();

    if (!path) return "";

    path = path.replace(/\\/g, "/");

    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    ) {
      return path;
    }

    path = path.replace(/^(?:\.\/)+/, "");
    path = path.replace(/^(?:\.\.\/)+/, "");
    path = path.replace(/^\/+/, "");

    return path;
  }

  // ==========================================================
  // SECTION 3: TARGETED BEACH PAVILLION PATH FIX
  //
  // Only normalizes the known Beach Pavillion folder / file.
  // Other accommodation paths remain untouched.
  // ==========================================================

  function applyKnownAccommodationPathFixes(path) {
    const lowerPath = String(path || "").toLowerCase();

    if (
      lowerPath ===
        "images/accommodations/function-area/beach-pavillion.jpg" ||
      lowerPath ===
        "images/accommodations/function-area/beach-pavilion.jpg"
    ) {
      return "images/accommodations/Function-Area/Beach-Pavillion.jpg";
    }

    return path;
  }

  // ==========================================================
  // SECTION 4: CREATE FILENAME CASE VARIANTS
  // Keeps directory capitalization unchanged.
  // ==========================================================

  function buildFilenameCaseVariants(path) {
    const variants = [path];

    const lastSlash = path.lastIndexOf("/");

    if (lastSlash >= 0) {
      const directory = path.slice(0, lastSlash + 1);
      const filename = path.slice(lastSlash + 1);

      const lowercaseFilename = filename.toLowerCase();

      if (lowercaseFilename !== filename) {
        variants.push(`${directory}${lowercaseFilename}`);
      }
    }

    return variants;
  }

  // ==========================================================
  // SECTION 5: PAVILION / PAVILLION SPELLING VARIANTS
  // ==========================================================

  function buildPavilionVariants(path) {
    const variants = [path];

    const pavillionVariant = path
      .replace(/Beach-Pavilion(\.[a-z0-9]+)$/i, "Beach-Pavillion$1")
      .replace(/Pool-Pavilion(\.[a-z0-9]+)$/i, "Pool-Pavillion$1");

    if (!variants.includes(pavillionVariant)) {
      variants.push(pavillionVariant);
    }

    return variants;
  }

  // ==========================================================
  // SECTION 6: COMBINE STATIC PATH VARIANTS
  // ==========================================================

  function buildStaticPathVariants(path) {
    const result = [];

    const canonicalPath = applyKnownAccommodationPathFixes(path);

    // Try the known canonical path first.
    [canonicalPath, path].forEach((sourcePath) => {
      buildFilenameCaseVariants(sourcePath).forEach((caseVariant) => {
        buildPavilionVariants(caseVariant).forEach((spellingVariant) => {
          if (!result.includes(spellingVariant)) {
            result.push(spellingVariant);
          }
        });
      });
    });

    return result;
  }

  // ==========================================================
  // SECTION 7: BUILD URL CANDIDATES
  // ==========================================================

  function buildImageCandidates(value) {
    const original = String(value || "").trim();

    if (!original) {
      return [];
    }

    if (
      original.startsWith("http://") ||
      original.startsWith("https://") ||
      original.startsWith("data:") ||
      original.startsWith("blob:")
    ) {
      return [original];
    }

    const cleanPath = normalizeStaticImagePath(original);

    // --------------------------------------------------------
    // Backend-uploaded images
    // --------------------------------------------------------

    if (cleanPath.startsWith("uploads/")) {
      const backendBase =
        typeof API_BASE === "string"
          ? API_BASE.replace(/\/api\/?$/, "")
          : "";

      return backendBase
        ? [`${backendBase}/${cleanPath}`]
        : [`/${cleanPath}`];
    }

    // --------------------------------------------------------
    // Static frontend images
    // --------------------------------------------------------

    const withoutFrontend = cleanPath.startsWith("frontend/")
      ? cleanPath.replace(/^frontend\//, "")
      : cleanPath;

    const pathVariants = buildStaticPathVariants(withoutFrontend);
    const candidates = [];

    const pageUsesFrontendPrefix =
      window.location.pathname.includes("/frontend/");

    pathVariants.forEach((relativePath) => {
      if (!pageUsesFrontendPrefix) {
        candidates.push(`/${relativePath}`);
        candidates.push(`/frontend/${relativePath}`);
      } else {
        candidates.push(`/frontend/${relativePath}`);
        candidates.push(`/${relativePath}`);
      }

      candidates.push(`../${relativePath}`);
    });

    if (cleanPath.startsWith("frontend/")) {
      candidates.push(`/${cleanPath}`);
    }

    return [...new Set(candidates)]
      .filter(Boolean)
      .map((candidate) => encodeURI(candidate));
  }

  // ==========================================================
  // SECTION 8: RESILIENT IMAGE LOADER
  // ==========================================================

  function configureResilientImage(img, rawPath) {
    if (!img) return;

    const candidates = buildImageCandidates(rawPath);

    img.removeAttribute("onerror");

    let candidateIndex = 0;

    img.onerror = function () {
      candidateIndex += 1;

      if (candidateIndex < candidates.length) {
        img.src = candidates[candidateIndex];
        return;
      }

      img.onerror = null;
      img.src = MOBILE_IMAGE_FALLBACK;
    };

    if (!candidates.length) {
      img.onerror = null;
      img.src = MOBILE_IMAGE_FALLBACK;
      return;
    }

    img.src = candidates[0];
  }

  // ==========================================================
  // SECTION 9: FIX RENDERED COVER + GALLERY IMAGES
  // ==========================================================

  function enhanceRenderedAccommodationImages(rooms) {
    const container = document.getElementById("roomsContainer");

    if (!container || !Array.isArray(rooms)) return;

    const cards = container.querySelectorAll(".room-ai-card");

    cards.forEach((card, roomIndex) => {
      const room = rooms[roomIndex];

      if (!room) return;

      const coverImage = card.querySelector(".room-photo-wrap > img");

      configureResilientImage(
        coverImage,
        room.image || ""
      );

      const galleryImages = Array.isArray(room.gallery_images)
        ? room.gallery_images.slice(0, 8)
        : [];

      const galleryElements =
        card.querySelectorAll(".room-gallery-strip img");

      galleryElements.forEach((img, imageIndex) => {
        configureResilientImage(
          img,
          galleryImages[imageIndex] || ""
        );
      });
    });
  }

  // ==========================================================
  // SECTION 10: WRAP EXISTING renderRooms()
  // ==========================================================

  if (typeof window.renderRooms === "function") {
    const originalRenderRooms = window.renderRooms;

    window.renderRooms = function (rooms) {
      originalRenderRooms(rooms);
      enhanceRenderedAccommodationImages(rooms);
    };
  }

  // ==========================================================
  // SECTION 11: OVERRIDE EXISTING PATH RESOLVER
  // ==========================================================

  window.resolveImagePath = function (value) {
    const candidates = buildImageCandidates(value);

    return candidates.length
      ? candidates[0]
      : MOBILE_IMAGE_FALLBACK;
  };

  // ==========================================================
  // SECTION 12: IMAGE VIEWER FIX
  // ==========================================================

  if (typeof window.showCurrentViewerImage === "function") {
    window.showCurrentViewerImage = function () {
      const modal = document.getElementById("imageViewerModal");
      const image = document.getElementById("imageViewerImg");
      const caption = document.getElementById("imageViewerCaption");
      const counter = document.getElementById("imageViewerCounter");

      if (!modal || !image || !caption) return;

      const currentImage =
        currentViewerImages[currentViewerIndex] || "";

      configureResilientImage(image, currentImage);

      caption.textContent =
        currentViewerCaption || "Accommodation Photo";

      if (counter) {
        counter.textContent =
          `${currentViewerIndex + 1} of ${currentViewerImages.length}`;
      }

      modal.classList.add("show");
    };
  }

  // ==========================================================
  // SECTION 13: DEBUG MESSAGE
  // ==========================================================

  console.log(
    "[Rooms Image Fix V3] Beach Pavillion canonical path fix enabled."
  );
})();
