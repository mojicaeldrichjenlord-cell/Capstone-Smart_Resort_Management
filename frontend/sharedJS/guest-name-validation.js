// Stage AUTH-71: shared guest name fields (registration and both booking sources).
(function () {
  "use strict";
  const NAME_PATTERN = /^\p{L}[\p{L}\p{M}]*(?: +\p{L}[\p{L}\p{M}]*)*$/u;
  function isValidName(value, optional = false) {
    if (value === undefined || value === null) return optional;
    if (typeof value !== "string") return false;
    const name = value.trim();
    return optional && !name ? true : NAME_PATTERN.test(name);
  }
  function hasValidNameParts(first, middle, last) {
    return isValidName(first) && isValidName(middle, true) && isValidName(last);
  }
  const NAME_ERROR = "First, middle and last names may contain letters and spaces only.";
  
  function sanitizeName(value) {
    return value.replace(/[^\p{L}\p{M} ]/gu, "");
  }
  function attachNameField(field) {
    function sanitize(event) {
      if (event?.isComposing) return;
      const original = field.value;
      const next = sanitizeName(original);
      if (original === next) return;
      const start = field.selectionStart;
      const end = field.selectionEnd;
      field.value = next;
      if (start !== null && end !== null) {
        field.setSelectionRange(sanitizeName(original.slice(0, start)).length,
          sanitizeName(original.slice(0, end)).length);
      }
    }
    field.addEventListener("input", sanitize);
    field.addEventListener("compositionend", sanitize);
  }
  window.GuestNameValidation = { isValidName, hasValidNameParts, sanitizeName, NAME_ERROR };
  ["firstName", "middleName", "lastName"].forEach(id => {
    const field = document.getElementById(id);
    if (field) attachNameField(field);
  });
})();
