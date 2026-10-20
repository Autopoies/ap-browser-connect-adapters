(() => {
  // Closes every open menu by toggling the expanded triggers off. Does not clear
  // the shared accumulator (menus-collect.js reads it afterwards).
  const modeToggle = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
  const uploadToggle = Array.from(
    document.querySelectorAll('input-container button[aria-haspopup="menu"]'),
  ).find((b) => !b.getAttribute("data-test-id"));
  if (modeToggle && modeToggle.getAttribute("aria-expanded") === "true") modeToggle.click();
  if (uploadToggle && uploadToggle.getAttribute("aria-expanded") === "true") uploadToggle.click();
  return { closeRequested: true };
})();
