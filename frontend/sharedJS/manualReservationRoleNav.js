// ============================================================
// SMARTRESORT MANUAL RESERVATION ROLE NAVIGATION
//
// File:
// frontend/sharedJS/manualReservationRoleNav.js
//
// Final role rule:
// - Manual Reservation is a Front Desk operation.
// - Administrator accounts are redirected back to the Admin dashboard.
// - Legacy "staff" is normalized to Front Desk.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const user = getManualPageUser();

  if (!user) {
    window.location.replace("../authHTML/login.html");
    return;
  }

  const role = normalizeManualPageRole(user.role);

  if (role === "frontdesk") {
    configureFrontDeskManualPage();
    setupFrontDeskSuccessfulReservationRedirect();
    return;
  }

  if (role === "admin") {
    window.location.replace("admin.html");
    return;
  }

  const routes = {
    customer: "../customerHTML/index.html",
    manager: "../managerHTML/managerDashboard.html",
    housekeeping: "../housekeepingHTML/housekeepingDashboard.html",
  };

  window.location.replace(
    routes[role] || "../authHTML/login.html",
  );
});

// ============================================================
// SECTION 1: User / role helpers
// ============================================================

function getManualPageUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("manualReservationRoleNav user parse error:", error);
    return null;
  }
}

function normalizeManualPageRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (value === "staff") {
    return "frontdesk";
  }

  return value;
}

// ============================================================
// SECTION 2: Front Desk navigation
// ============================================================

function configureFrontDeskManualPage() {
  const logo = document.getElementById("manualRoleLogo");
  const nav = document.getElementById("manualRoleNav");
  const manualLink = document.querySelector(
    "[data-manual-reservation-link]",
  );

  if (logo) {
    logo.textContent = "Arvic Seaside";
  }

  document.title = document.title.replace(
    "SmartResort Admin",
    "SmartResort Front Desk",
  );

  document
    .querySelectorAll("[data-admin-only]")
    .forEach((element) => {
      element.hidden = true;
      element.style.display = "none";
    });

  if (nav && manualLink) {
    addFrontDeskNavLink({
      id: "frontDeskDashboardNav",
      href: "../frontdeskHTML/frontdeskDashboard.html",
      label: "Dashboard",
      before: manualLink,
    });

    addFrontDeskNavLink({
      id: "frontDeskReservationsNav",
      href: "../frontdeskHTML/frontdeskReservations.html",
      label: "Reservations",
      before: manualLink,
    });

    addFrontDeskNavLink({
      id: "frontDeskPaymentsNav",
      href: "../frontdeskHTML/frontdeskPayments.html",
      label: "Payments",
      before: manualLink,
    });

    addFrontDeskNavLink({
      id: "frontDeskGuestsNav",
      href: "../frontdeskHTML/frontdeskGuests.html",
      label: "Guests",
      before: manualLink,
    });
  }

  document
    .querySelectorAll("[data-dashboard-link]")
    .forEach((element) => {
      element.href =
        "../frontdeskHTML/frontdeskDashboard.html";
    });
}

function addFrontDeskNavLink({
  id,
  href,
  label,
  before,
}) {
  if (document.getElementById(id)) {
    return;
  }

  const link = document.createElement("a");

  link.id = id;
  link.href = href;
  link.textContent = label;

  before.parentElement?.insertBefore(
    link,
    before,
  );
}

// ============================================================
// SECTION 3: Successful Front Desk submission redirect
// ============================================================

function setupFrontDeskSuccessfulReservationRedirect() {
  const isPaymentPage =
    window.location.pathname
      .toLowerCase()
      .endsWith(
        "/admin-walkin-payment.html",
      );

  if (!isPaymentPage) {
    return;
  }

  let redirectStarted = false;

  const goToFrontDeskGuests = () => {
    if (redirectStarted) {
      return;
    }

    redirectStarted = true;

    window.location.replace(
      "../frontdeskHTML/frontdeskGuests.html?created=1",
    );
  };

  // Fallback A:
  // If the successful payment page unexpectedly reloaded,
  // the payment JS leaves this hash marker in the URL.
  if (
    window.location.hash ===
    "#manual-reservation-created"
  ) {
    goToFrontDeskGuests();
    return;
  }

  // Fallback B:
  // Watch the payment page success message.
  const messageElement =
    document.getElementById(
      "adminPaymentMessage",
    );

  if (!messageElement) {
    return;
  }

  const redirectIfSuccessful = () => {
    if (redirectStarted) {
      return;
    }

    const message = String(
      messageElement.textContent || "",
    )
      .trim()
      .toLowerCase();

    const looksSuccessful =
      message.includes("success") ||
      message.includes(
        "created successfully",
      );

    if (!looksSuccessful) {
      return;
    }

    goToFrontDeskGuests();
  };

  const observer =
    new MutationObserver(
      redirectIfSuccessful,
    );

  observer.observe(messageElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  redirectIfSuccessful();
}