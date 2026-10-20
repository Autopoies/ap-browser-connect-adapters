(() => {
  // Synchronous: with the upload & tools menu open, either clicks one available
  // tool (index, else name) or deselects every selected tool when clear is true.
  const rawIdx = "{{args.index}}";
  const targetIndex =
    rawIdx !== "" && rawIdx !== "null" && rawIdx !== "undefined" ? parseInt(rawIdx, 10) : -1;
  const targetName = "{{args.name}}".trim().toLowerCase();
  const clear = "{{args.clear}}" === "true";
  const lineOf = (el) => ((el.innerText || "").trim().split("\n")[0] || "").trim();

  if (clear) {
    const deselect = Array.from(
      document.querySelectorAll('toolbox-drawer [data-test-id="deselect-drawer-item-gem-button"]'),
    );
    deselect.forEach((el) => el.click());
    window.__apSelect = { cleared: deselect.length };
    return window.__apSelect;
  }

  const pane = Array.from(document.querySelectorAll(".cdk-overlay-pane"))
    .filter((p) => p.getBoundingClientRect().height > 0)
    .filter((p) => !p.querySelector("gem-menu") &&
      p.querySelector("button.mat-mdc-list-item, [role='menuitem']"))
    .pop();
  // Same tool filter as menus-read-tools.js, so indexes match 'gemini menus'.
  const tools = pane ? Array.from(pane.querySelectorAll("button.mat-mdc-list-item, [role='menuitem']"))
    .filter((el) => !el.getAttribute("data-test-id") && !el.getAttribute("aria-haspopup") &&
      !Array.from(el.classList).some((c) => c.startsWith("hidden-")) && lineOf(el).length > 0) : [];

  if (tools.length === 0) {
    window.__apSelect = { modeIndex: targetIndex, modeName: targetName, error: "tools menu not open" };
    return window.__apSelect;
  }

  let target = null;
  if (targetIndex >= 0 && targetIndex < tools.length) {
    target = tools[targetIndex];
  } else if (targetName) {
    const exact = tools.find((el) => lineOf(el).toLowerCase() === targetName);
    const partial = tools
      .filter((el) => lineOf(el).toLowerCase().includes(targetName))
      .sort((a, b) => lineOf(a).length - lineOf(b).length);
    target = exact || partial[0] || null;
  }

  if (!target) {
    const toggle = Array.from(document.querySelectorAll('input-container button[aria-haspopup="menu"]'))
      .find((b) => !b.getAttribute("data-test-id"));
    if (toggle && toggle.getAttribute("aria-expanded") === "true") toggle.click();
    window.__apSelect = {
      modeIndex: targetIndex,
      modeName: targetName,
      error: "target tool not found in menu",
      available: tools.map(lineOf),
    };
    return window.__apSelect;
  }

  const chosen = lineOf(target);
  target.click();
  window.__apSelect = {
    modeIndex: tools.indexOf(target),
    modeName: targetName,
    text: chosen,
  };
  return { clicked: chosen, modeIndex: tools.indexOf(target) };
})();
