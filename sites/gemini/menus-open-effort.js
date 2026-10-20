(() => {
  // Opens the thinking-level submenu. Requires the model menu to be open.
  const trigger = document.querySelector('gem-menu gem-menu-item[value="thinking_level"]');
  if (!trigger) return { opened: false, error: "thinking-level trigger not found (model menu not open?)" };
  if (trigger.getAttribute("aria-expanded") !== "true") trigger.click();
  return { opened: true };
})();
