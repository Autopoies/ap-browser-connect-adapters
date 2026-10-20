(() => {
  // Opens the model menu if it is closed (JS click: not affected by tooltips that
  // can cover the button at the pointer position). Idempotent.
  const toggle = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
  if (!toggle) return { opened: false, error: "model menu button not found" };
  if (toggle.getAttribute("aria-expanded") !== "true") toggle.click();
  return { opened: true };
})();
