(() => {
  // Opens the "more tools" submenu inside the upload & tools menu. Idempotent.
  const btn = document.querySelector('button[data-test-id="more-tools-button"]');
  if (!btn) return { opened: false, error: "more-tools button not found (upload menu not open?)" };
  if (btn.getAttribute("aria-expanded") !== "true") btn.click();
  return { opened: true };
})();
