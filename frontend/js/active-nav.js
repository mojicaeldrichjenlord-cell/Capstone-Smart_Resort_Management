// Browser behavior for active nav. Handles clicks, reads API results and updates the page.
// Note: Keep existing behavior unchanged when adding new features.
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".navbar nav a");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");

    if (!linkPage || linkPage === "#") return;

    if (linkPage === currentPage) {
      link.classList.add("active-nav");
    }
  });
});