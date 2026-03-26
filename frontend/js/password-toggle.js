document.addEventListener("DOMContentLoaded", () => {
  const passwordGroups = document.querySelectorAll(".password-group");

  passwordGroups.forEach((group) => {
    const input = group.querySelector("input");
    const toggleBtn = group.querySelector(".toggle-password");

    if (!input || !toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggleBtn.textContent = isPassword ? "Hide" : "Show";
    });
  });
});