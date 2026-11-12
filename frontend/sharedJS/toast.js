// ============================================================
// SHARED FLOATING TOAST NOTIFICATION
// The fixed-position .toast CSS keeps notifications centered
// without becoming a flex/grid item or resizing any page.
// ============================================================
function showToast(message, type = "success") {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  // Only use known visual styles; never interpolate untrusted classes.
  const safeType = ["success", "error", "info"].includes(type) ? type : "info";
  toast.textContent = String(message ?? "");
  toast.setAttribute("role", safeType === "error" ? "alert" : "status");
  toast.setAttribute("aria-live", safeType === "error" ? "assertive" : "polite");
  toast.setAttribute("aria-atomic", "true");
  toast.className = `toast toast-${safeType} show`;

  // Reusing the existing toast prevents overlapping pop-ups.
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, safeType === "error" ? 5000 : 3500);
}
