// ============================================================
// ACCOMMODATION IMAGE MOBILE / VERCEL COMPATIBILITY FIX
// File: frontend/customerJS/rooms-image-mobile-fix.js
//
// Purpose:
// - Keep the existing rooms.js logic untouched.
// - Fix accommodation images that work locally but fail on
//   deployed/mobile browsers.
// - Support both common Vercel layouts:
//     /images/...
//     /frontend/images/...
// - Support database paths with frontend/, ../, ./, or \.
// - Try alternate static paths before showing a fallback.
// - Also fixes gallery thumbnails and image viewer.
// ============================================================

(function () {
  "use strict";

  // ==========================================================
  // SECTION 1: FALLBACK IMAGE
  // Used only after all possible image paths fail.
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
  // SECTION 2: PATH NORMALIZER
  // Converts Windows slashes and removes unnecessary prefixes.
  // ==========================================================

  function normalizeStaticImagePath(value) {
    let path = String(value || "").trim();

    if (!path) return "";

    path = path.replace(/\\/g, "/");

    // Keep true external/data URLs unchanged.
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    ) {
      return path;
    }

    // Remove repeated ./ and ../ prefixes.
    path = path.replace(/^(?:\.\/)+/, "");
    path = path.replace(/^(?:\.\.\/)+/, "");
    path = path.replace(/^\/+/, "");

    return path;
  }

  // ==========================================================
  // SECTION 3: KNOWN SPELLING COMPATIBILITY
  // Repository filenames use "Pavillion".
  // This also accepts database values written as "Pavilion".
  // ==========================================================

  function buildSpellingVariants(path) {
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
  // SECTION 4: BUILD IMAGE CANDIDATES
  //
  // We intentionally try more than one valid project-root style.
  // This makes the same database path work on:
  // - Local Live Server
  // - Vercel with frontend as Root Directory
  // - Vercel with repository root serving /frontend/
  // - Desktop and mobile browsers
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

    let cleanPath = normalizeStaticImagePath(original);

    // Backend-uploaded images must come from Render/backend.
    if (cleanPath.startsWith("uploads/")) {
      const backendBase =
        typeof API_BASE === "string"
          ? API_BASE.replace(/\/api\/?$/, "")
          : "";

      return backendBase
        ? [`${backendBase}/${cleanPath}`]
        : [`/${cleanPath}`];
    }

    // Convert:
    // frontend/images/... -> images/...
    const withoutFrontend = cleanPath.startsWith("frontend/")
      ? cleanPath.replace(/^frontend\//, "")
      : cleanPath;

    const spellingVariants = buildSpellingVariants(withoutFrontend);
    const candidates = [];

    const pageUsesFrontendPrefix =
      window.location.pathname.includes("/frontend/");

    spellingVariants.forEach((relativePath) => {
      // When page itself is /frontend/customerHTML/..., try /frontend first.
      if (pageUsesFrontendPrefix) {
        candidates.push(`/frontend/${relativePath}`);
        candidates.push(`/${relativePath}`);
      } else {
        // Normal Vercel setup where frontend is the project root.
        candidates.push(`/${relativePath}`);
        candidates.push(`/frontend/${relativePath}`);
      }

      // Local customerHTML pages can also resolve this relative path.
      candidates.push(`../${relativePath}`);
    });

    // Preserve a root version of the original database value too.
    if (cleanPath.startsWith("frontend/")) {
      candidates.push(`/${cleanPath}`);
    }

    // Remove duplicates and safely encode spaces/special URL characters.
    return [...new Set(candidates)]
      .filter(Boolean)
      .map((candidate) => encodeURI(candidate));
  }

  // ==========================================================
  // SECTION 5: RESILIENT IMAGE LOADER
  // Tries each candidate before showing fallback.
  // ==========================================================

  function configureResilientImage(img, rawPath) {
    if (!img) return;

    const candidates = buildImageCandidates(rawPath);

    // Remove old inline fallback so it does not stop our retry chain.
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
  // SECTION 6: PATCH ALL IMAGES AFTER ROOMS ARE RENDERED
  // Uses the actual room objects, so no database value is lost.
  // ==========================================================

  function enhanceRenderedAccommodationImages(rooms) {
    const container = document.getElementById("roomsContainer");

    if (!container || !Array.isArray(rooms)) return;

    const cards = container.querySelectorAll(".room-ai-card");

    cards.forEach((card, roomIndex) => {
      const room = rooms[roomIndex];

      if (!room) return;

      // Main / cover photo.
      const coverImage = card.querySelector(".room-photo-wrap > img");

      configureResilientImage(
        coverImage,
        room.image || ""
      );

      // Gallery thumbnails.
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
  // SECTION 7: WRAP EXISTING renderRooms()
  // Keeps all original design and behavior.
  // We only add resilient image loading after it renders.
  // ==========================================================

  if (typeof window.renderRooms === "function") {
    const originalRenderRooms = window.renderRooms;

    window.renderRooms = function (rooms) {
      originalRenderRooms(rooms);
      enhanceRenderedAccommodationImages(rooms);
    };
  }

  // ==========================================================
  // SECTION 8: OVERRIDE resolveImagePath()
  // Other existing room.js features can keep calling the same
  // function name while receiving a production-safe first path.
  // ==========================================================

  window.resolveImagePath = function (value) {
    const candidates = buildImageCandidates(value);

    return candidates.length
      ? candidates[0]
      : MOBILE_IMAGE_FALLBACK;
  };

  // ==========================================================
  // SECTION 9: IMAGE VIEWER COMPATIBILITY
  // Makes the fullscreen viewer use the same retry logic.
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
  // SECTION 10: OPTIONAL DEBUG MESSAGE
  // Helpful while testing mobile/Vercel.
  // ==========================================================

  console.log(
    "[Rooms Image Fix] Mobile/Vercel accommodation image compatibility enabled."
  );
})();
