(() => {
  // Reads the upload & tools menu (requires uploadOpen) and the tools already
  // selected in the composer. Upload actions carry a data-test-id; tools are
  // plain list items (no data-test-id, no submenu, not a hidden file trigger).
  const lineOf = (el) => ((el.innerText || "").trim().split("\n")[0] || "").trim();
  const visible = (el) => el.getBoundingClientRect().height > 0;
  const pane = Array.from(document.querySelectorAll(".cdk-overlay-pane"))
    .filter(visible)
    .filter((p) => !p.querySelector("gem-menu") &&
      p.querySelector("button.mat-mdc-list-item, [role='menuitem']"))
    .pop();
  if (!pane) return { error: "upload menu not open" };
  const actions = Array.from(pane.querySelectorAll("button[data-test-id]"))
    .map((el) => ({ id: el.getAttribute("data-test-id"), label: lineOf(el) }))
    .filter((a) => a.label.length > 0);
  const available = Array.from(pane.querySelectorAll("button.mat-mdc-list-item, [role='menuitem']"))
    .filter((el) => !el.getAttribute("data-test-id") && !el.getAttribute("aria-haspopup") &&
      !Array.from(el.classList).some((c) => c.startsWith("hidden-")) && lineOf(el).length > 0)
    .map((el, index) => ({ index, label: lineOf(el) }));
  const selected = Array.from(
    document.querySelectorAll('toolbox-drawer [data-test-id="deselect-drawer-item-gem-button"]'),
  ).map((el) => ({ label: (el.innerText || "").trim() })).filter((t) => t.label.length > 0);
  window.__apMenus = Object.assign(window.__apMenus || {}, {
    upload: { actions },
    tools: { selected, available },
  });
  return { upload: { actions }, tools: { selected, available } };
})();
