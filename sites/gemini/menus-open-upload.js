(() => {
  // Opens the upload & tools menu. Idempotent.
  const toggle = Array.from(
    document.querySelectorAll('input-container button[aria-haspopup="menu"]'),
  ).find((b) => !b.getAttribute("data-test-id"));
  if (!toggle) return { opened: false, error: "upload & tools button not found" };
  if (toggle.getAttribute("aria-expanded") !== "true") toggle.click();
  return { opened: true };
})();
