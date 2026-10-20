(() => {
  // Reads the thinking-level submenu. Requires effortOpen (see wait step).
  // The submenu is the visible overlay pane that holds plain gem-menu-items
  // (no data-test-id) and no model options.
  const lineOf = (el) => ((el.innerText || "").trim().split("\n")[0] || "").trim();
  const visible = (el) => el.getBoundingClientRect().height > 0;
  const pane = Array.from(document.querySelectorAll(".cdk-overlay-pane"))
    .filter(visible)
    .filter((p) => !p.querySelector('[data-test-id^="bard-mode-option-"]') &&
      !p.querySelector("button.mat-mdc-list-item") &&
      p.querySelector("gem-menu-item:not([data-test-id])"))
    .pop();
  if (!pane) return { error: "effort submenu not open" };
  const items = Array.from(pane.querySelectorAll("gem-menu-item:not([data-test-id])"))
    .map((el, index) => ({ index, label: lineOf(el), selected: el.classList.contains("selected") }))
    .filter((e) => e.label.length > 0);
  const efforts = { current: (items.find((e) => e.selected) || {}).label || null, items };
  window.__apMenus = Object.assign(window.__apMenus || {}, { efforts });
  return { efforts };
})();
