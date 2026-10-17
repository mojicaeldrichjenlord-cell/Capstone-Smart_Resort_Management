// Mobile map read-only layout tests: no database, network, or marker writes.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const frontend = path.resolve(__dirname, "../../frontend");
const html = fs.readFileSync(path.join(frontend, "adminHTML/admin-map-editor.html"), "utf8");
const css = fs.readFileSync(path.join(frontend, "adminCSS/admin-map-editor.css"), "utf8");
const js = fs.readFileSync(path.join(frontend, "adminJS/admin-map-editor.js"), "utf8");

test("map and marker layer use the same scrollable mobile viewport", () => {
  const viewport = html.indexOf('class="map-editor-viewport"');
  const map = html.indexOf('id="mapEditorWrap"');
  const markers = html.indexOf('id="mapMarkersLayer"');
  const hint = html.indexOf('id="mapMobileHint"');
  assert.ok(viewport > 0 && map > viewport && markers > map);
  assert.ok(hint > markers);
  assert.match(html, /aria-label="Scrollable resort map"/);
  assert.match(html, /aria-describedby="mapMobileHint"/);
  assert.match(html, /tabindex="0"/);
});

test("mobile screen scrolls enlarged map horizontally instead of shrinking markers", () => {
  assert.match(css, /\.map-editor-viewport\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /@media\s*\(max-width:\s*700px\)\s*\{[^]*\.map-editor-viewport \.map-editor-wrap\s*\{[^}]*width:\s*680px/s);
  assert.match(css, /\.map-editor-viewport \.admin-map-marker\s*\{[^}]*width:\s*28px/s);
  assert.match(css, /\.editor-layout\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /#mapMarkersLayer\s*\{[^}]*position:\s*absolute/s);
});

test("existing percentage calculation remains correct when canvas scrolls", () => {
  const start = js.indexOf("function getPercentPosition(event, container) {");
  const end = js.indexOf("function createTempId()", start);
  assert.ok(start >= 0 && end > start);
  const sandbox = {};
  vm.runInNewContext(js.slice(start, end) + "\nthis.mapPercent = getPercentPosition;", sandbox);
  // A 680px canvas shifted 160px left inside a mobile viewport.
  const rect = {left: -160, top: 100, width: 680, height: 350};
  const pos = sandbox.mapPercent(
    {clientX: 180, clientY: 275},
    {getBoundingClientRect() {return rect;}}
  );
  assert.equal(pos.x, 50);
  assert.equal(pos.y, 50);
  // The selected map ID and marker-saving routes must not change.
  assert.match(js, /getElementById\("mapEditorWrap"\)/);
  assert.match(js, /saveLayoutBtn/);
  assert.match(js, /saveMarkersToDB/);
});
