(() => {
  // Start a menu read from a clean state: clear the shared accumulator and
  // toggle closed any menu that is currently open. No timers; the following
  // wait step confirms the menus are idle.
  window.__apMenus = {};
  const modeToggle = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
  const uploadToggle = Array.from(
    document.querySelectorAll('input-container button[aria-haspopup="menu"]'),
  ).find((b) => !b.getAttribute("data-test-id"));
  if (modeToggle && modeToggle.getAttribute("aria-expanded") === "true") modeToggle.click();
  if (uploadToggle && uploadToggle.getAttribute("aria-expanded") === "true") uploadToggle.click();
  return { reset: true };
})();
