// SMART RESORT BOOKING SYSTEM - Customer accommodation image path regression tests.
// The compatibility shim runs after rooms.js in the browser. Simulate that
// script using vm; no database, server, Azure or browser is needed.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(
  path.join(__dirname, "../../frontend/customerJS/rooms-image-mobile-fix.js"),
  "utf8"
);

function fakeImage() {
  return {
    src: "",
    onerror: null,
    removeAttribute(name) {
      if (name === "onerror") this.onerror = null;
    },
  };
}

function mount({ pathname = "/frontend/customerHTML/rooms.html",
  apiBase = "http://127.0.0.1:5000/api" } = {}) {
  const cover = fakeImage();
  const thumbnails = [fakeImage(), fakeImage(), fakeImage()];
  const viewer = fakeImage();
  const card = {
    querySelector(selector) {
      return selector === ".room-photo-wrap > img" ? cover : null;
    },
    querySelectorAll(selector) {
      return selector === ".room-gallery-strip img" ? thumbnails : [];
    }
  };
  const container = {
    querySelectorAll(selector) {
      return selector === ".room-ai-card" ? [card] : [];
    }
  };
  const caption = { textContent: "" };
  const counter = { textContent: "" };
  const modal = { classList: { add(name) { this.added = name; } } };
  const nodes = {
    roomsContainer: container,
    imageViewerModal: modal,
    imageViewerImg: viewer,
    imageViewerCaption: caption,
    imageViewerCounter: counter,
  };
  const context = {
    API_BASE: apiBase,
    window: {
      location: { pathname },
      renderRooms() {},
      showCurrentViewerImage() {},
    },
    document: { getElementById(id) { return nodes[id] || null; } },
    currentViewerImages: [],
    currentViewerIndex: 0,
    currentViewerCaption: "QA Photo Upload Test",
    console: { log() {} }
  };
  vm.runInNewContext(script, context, { filename: "rooms-image-mobile-fix.js" });
  return { context, cover, thumbnails, viewer, modal, caption, counter };
}

test("Customer media paths go to Node backend rather than Live Server", () => {
  const h = mount();
  assert.equal(
    h.context.window.resolveImagePath("/api/rooms/media/123"),
    "http://127.0.0.1:5000/api/rooms/media/123"
  );
  assert.equal(
    h.context.window.resolveImagePath("api/rooms/media/2"),
    "http://127.0.0.1:5000/api/rooms/media/2"
  );
});

test("Vercel customer media paths use configured Render backend", () => {
  const h = mount({
    pathname: "/customerHTML/rooms.html",
    apiBase: "https://smartresort-backend.onrender.com/api"
  });
  assert.equal(
    h.context.window.resolveImagePath("/api/rooms/media/81"),
    "https://smartresort-backend.onrender.com/api/rooms/media/81"
  );
});

test("Customer cover, gallery and image viewer all use public media URLs", () => {
  const h = mount();
  const room = {
    image: "/api/rooms/media/4",
    gallery_images: ["/api/rooms/media/5", "/api/rooms/media/6", "/api/rooms/media/7"]
  };
  h.context.window.renderRooms([room]);
  assert.equal(h.cover.src, "http://127.0.0.1:5000/api/rooms/media/4");
  assert.deepEqual(
    h.thumbnails.map(x => x.src),
    [5, 6, 7].map(id => "http://127.0.0.1:5000/api/rooms/media/" + id)
  );
  h.context.currentViewerImages = [room.image, ...room.gallery_images];
  h.context.currentViewerIndex = 2;
  h.context.window.showCurrentViewerImage();
  assert.equal(h.viewer.src, "http://127.0.0.1:5000/api/rooms/media/6");
  assert.equal(h.modal.classList.added, "show");
  assert.equal(h.counter.textContent, "3 of 4");
});

test("Legacy static images and /uploads continue working", () => {
  const h = mount();
  assert.equal(
    h.context.window.resolveImagePath("images/accommodations/function-area/Beach-pavillion.jpg"),
    "/frontend/images/accommodations/Function-Area/Beach-Pavillion.jpg"
  );
  assert.equal(
    h.context.window.resolveImagePath("/uploads/example.jpg"),
    "http://127.0.0.1:5000/uploads/example.jpg"
  );
});

test("Invalid media identifiers cannot be mistaken for stored-media URLs", () => {
  const h = mount();
  // These are NOT routed to backend /api/rooms/media/:id. Server rejects bad
  // IDs too; this test ensures the client does not overmatch path patterns.
  const value = h.context.window.resolveImagePath("/api/rooms/media/abc");
  assert.notEqual(value, "http://127.0.0.1:5000/api/rooms/media/abc");
});
