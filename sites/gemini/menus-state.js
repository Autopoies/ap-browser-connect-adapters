(() => {
  // Menu state probe for the wait steps. Synchronous, no timers: the CLI polls
  // this expression, so it keeps working when the tab is hidden.
  // Structural hooks only.
  const visible = (el) => !!el && el.getBoundingClientRect().height > 0;
  const modeToggle = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
  const uploadToggle = Array.from(
    document.querySelectorAll('input-container button[aria-haspopup="menu"]'),
  ).find((b) => !b.getAttribute("data-test-id"));
  const panes = Array.from(document.querySelectorAll(".cdk-overlay-pane")).filter(visible);
  const modelPane = panes.find((p) => p.querySelector('[data-test-id^="bard-mode-option-"]'));
  const effortPane = panes.find(
    (p) => !p.querySelector('[data-test-id^="bard-mode-option-"]') &&
      !p.querySelector("button.mat-mdc-list-item") &&
      p.querySelector("gem-menu-item:not([data-test-id])"),
  );
  const uploadPane = panes.find(
    (p) => !p.querySelector("gem-menu") &&
      p.querySelector("button.mat-mdc-list-item, [role='menuitem']"),
  );
  const togglePane = panes.find((p) => p.querySelector('button[role="switch"]'));
  const modeExpanded = !!modeToggle && modeToggle.getAttribute("aria-expanded") === "true";
  const uploadExpanded = !!uploadToggle && uploadToggle.getAttribute("aria-expanded") === "true";
  return {
    modeOpen: modeExpanded && !!modelPane,
    effortOpen: !!effortPane,
    uploadOpen: !!uploadPane && uploadExpanded,
    toggleOpen: !!togglePane,
    idle: !modeExpanded && !uploadExpanded && panes.length === 0,
    visiblePanes: panes.length,
  };
})();
