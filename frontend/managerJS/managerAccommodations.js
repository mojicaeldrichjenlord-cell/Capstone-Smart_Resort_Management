// Manager inventory: backend-verified signed Manager role; UI has no Admin writes.
// Changes only listing status + 3 rates, with optimistic concurrency checks.
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("managerToken");
  const message = document.getElementById("inventoryMessage");
  const tbody = document.getElementById("inventoryBody");
  const search = document.getElementById("inventorySearch");
  const category = document.getElementById("inventoryCategory");
  const statusFilter = document.getElementById("inventoryStatusFilter");
  const filters = document.getElementById("inventoryFilters");
  const dialog = document.getElementById("inventoryDialog");
  const form = document.getElementById("inventoryEditForm");
  const headingName = document.getElementById("inventoryDialogName");
  const saveButton = document.getElementById("saveInventoryEdit");
  const editStatus = document.getElementById("editInventoryStatus");
  const editDay = document.getElementById("editDayPrice");
  const editOvernight = document.getElementById("editOvernightPrice");
  const editExtended = document.getElementById("editExtendedPrice");
  let allRooms = [];
  let editing = null;
  let loading = false;
  let saving = false;
  // Remove manager token and return to the shared login screen.
  function signOut() {
    sessionStorage.removeItem("managerToken");
    localStorage.removeItem("user");
    window.location.replace("../authHTML/login.html");
  }
  document.getElementById("logoutBtn")?.addEventListener("click", signOut);
  if (!token || !/^mgr1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    signOut();
    return;
  }

  // Authenticated Manager API helper, separate from Admin inventory routes.
  async function request(path, options = {}) {
    const response = await fetch(API_BASE + "/manager/" + path, {
      ...options, cache: "no-store",
      headers: {
        Authorization: "Bearer " + token,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (response.status === 401 || response.status === 403) {
      signOut();
      throw new Error("Manager access denied.");
    }
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Inventory operation failed.");
    }
    return data;
  }
  const money = value => Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  function td(tr, text) {
    const item = document.createElement("td");
    item.textContent = String(text ?? "—");
    tr.appendChild(item);
    return item;
  }
  // Populate filters from API categories, never accept injected HTML.
  function renderCategories() {
    const previous = category.value;
    category.replaceChildren();
    const all = document.createElement("option");
    all.value = "all";
    all.textContent = "All categories";
    category.appendChild(all);
    for (const name of [...new Set(allRooms.map(room => room.category))].sort()) {
      if (!name) continue;
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      category.appendChild(option);
    }
    category.value = Array.from(category.options).some(o => o.value === previous)
      ? previous : "all";
  }
  // Capture current server values for safe optimistic concurrency checks.
  function snapshot(room) {
    return {
      status: room.status,
      day_price: Number(room.day_price).toFixed(2),
      overnight_price: Number(room.overnight_price).toFixed(2),
      extended_price: Number(room.extended_price).toFixed(2),
    };
  }
  // Fill the confirmation dialog with permitted editable fields only.
  function edit(room) {
    if (saving || loading || !dialog?.showModal) return;
    editing = { id: room.id, name: room.name, expected: snapshot(room) };
    headingName.textContent = room.name + " · " + room.category;
    editStatus.value = room.status;
    editDay.value = room.day_price;
    editOvernight.value = room.overnight_price;
    editExtended.value = room.extended_price;
    if (!dialog.open) dialog.showModal();
  }
  // Display inventory as safe DOM nodes with current rate/status data.
  function render() {
    const query = search.value.trim().toLowerCase();
    const wantedCategory = category.value;
    const wantedStatus = statusFilter.value;
    const matches = allRooms.filter(room => (
      (!query || [room.name, room.category].some(v =>
        String(v || "").toLowerCase().includes(query))) &&
      (wantedCategory === "all" || room.category === wantedCategory) &&
      (wantedStatus === "all" || String(room.status).toLowerCase() === wantedStatus)
    ));
    tbody.replaceChildren();
    if (!matches.length) {
      const tr = document.createElement("tr");
      const cell = td(tr, "No matching accommodations.");
      cell.colSpan = 8;
      tbody.appendChild(tr);
    }
    for (const room of matches) {
      const tr = document.createElement("tr");
      td(tr, room.name);
      td(tr, room.category);
      td(tr, Number(room.capacity));
      td(tr, "₱" + money(room.day_price));
      td(tr, "₱" + money(room.overnight_price));
      td(tr, "₱" + money(room.extended_price));
      const badge = document.createElement("span");
      badge.className = "manager-inventory-status";
      badge.dataset.status = room.status;
      badge.textContent = room.status;
      td(tr, "").appendChild(badge);
      const action = td(tr, "");
      const button = document.createElement("button");
      button.className = "manager-inventory-edit";
      button.type = "button";
      button.textContent = "Edit rates / status";
      button.disabled = !["available", "unavailable"].includes(room.status);
      button.addEventListener("click", () => edit(room));
      action.appendChild(button);
      tbody.appendChild(tr);
    }
    message.textContent = "Showing " + matches.length + " of " +
      allRooms.length + " accommodations (latest database snapshot).";
  }
  // A fresh snapshot avoids overwriting another user's recent rate change.
  async function refreshInventory() {
    if (loading || saving) return;
    loading = true;
    message.textContent = "Loading accommodations…";
    try {
      const result = await request("accommodations");
      allRooms = Array.isArray(result.accommodations) ? result.accommodations : [];
      renderCategories();
      render();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      loading = false;
    }
  }
  filters?.addEventListener("submit", event => {
    event.preventDefault();
    refreshInventory();
  });
  search?.addEventListener("input", () => { if (!loading) render(); });
  category?.addEventListener("change", render);
  statusFilter?.addEventListener("change", render);
  document.getElementById("cancelInventoryEdit")?.addEventListener("click", () => {
    dialog.close(); editing = null;
  });
  dialog?.addEventListener("close", () => {
    if (!saving) editing = null;
  });
  form?.addEventListener("submit", async event => {
    event.preventDefault();
    if (saving || !editing) return;
    const desired = {
      status: editStatus.value,
      day_price: editDay.value,
      overnight_price: editOvernight.value,
      extended_price: editExtended.value,
    };
    if (!form.reportValidity()) return;
    if (!window.confirm("Save updated rates and listing status for " +
      editing.name + "? Existing reservation amounts will not change.")) return;
    saving = true;
    saveButton.disabled = true;
    const target = editing;
    let completionMessage = "";
    try {
      await request("accommodations/" + target.id + "/operations", {
        method: "PATCH",
        body: JSON.stringify({ ...desired, expected: target.expected }),
      });
      dialog.close();
      completionMessage = "Changes saved.";
    } catch (error) {
      completionMessage = error.message +
        " Please review the refreshed inventory before editing again.";
      dialog.close();
    } finally {
      saving = false;
      saveButton.disabled = false;
      editing = null;
      await refreshInventory();
      if (completionMessage) message.textContent = completionMessage + " " + message.textContent;
    }
  });
  (async () => {
    try {
      await request("me");
      await refreshInventory();
    } catch (error) {
      message.textContent = error.message;
    }
  })();
});