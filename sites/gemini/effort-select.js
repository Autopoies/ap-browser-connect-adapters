(() => {
  // Synchronous: picks a thinking level in the open effort submenu and clicks it.
  const rawIdx = "{{args.index}}";
  const targetIndex =
    rawIdx !== "" && rawIdx !== "null" && rawIdx !== "undefined" ? parseInt(rawIdx, 10) : -1;
  const targetLevel = "{{args.level}}".trim().toLowerCase();
  const lineOf = (el) => ((el.innerText || "").trim().split("\n")[0] || "").trim();
  const pane = Array.from(document.querySelectorAll(".cdk-overlay-pane"))
    .filter((p) => p.getBoundingClientRect().height > 0)
    .filter((p) => !p.querySelector('[data-test-id^="bard-mode-option-"]') &&
      !p.querySelector("button.mat-mdc-list-item") &&
      p.querySelector("gem-menu-item:not([data-test-id])"))
    .pop();
  const items = pane ? Array.from(pane.querySelectorAll("gem-menu-item:not([data-test-id])")) : [];

  if (items.length === 0) {
    window.__apSelect = { error: "effort submenu not open" };
    return window.__apSelect;
  }

  let target = null;
  if (targetIndex >= 0 && targetIndex < items.length) {
    target = items[targetIndex];
  } else if (targetLevel) {
    const exact = items.find((el) => lineOf(el).toLowerCase() === targetLevel);
    const partial = items
      .filter((el) => lineOf(el).toLowerCase().includes(targetLevel))
      .sort((a, b) => lineOf(a).length - lineOf(b).length);
    target = exact || partial[0] || null;
  }

  if (!target) {
    const toggle = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
    if (toggle && toggle.getAttribute("aria-expanded") === "true") toggle.click();
    window.__apSelect = {
      effortIndex: targetIndex,
      effortLevel: targetLevel,
      error: "target level not found in submenu",
      available: items.map(lineOf),
    };
    return window.__apSelect;
  }

  const chosen = lineOf(target);
  for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
    const Ctor = type.startsWith("pointer") ? PointerEvent : MouseEvent;
    target.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, button: 0, buttons: 1 }));
  }
  window.__apSelect = {
    effortIndex: items.indexOf(target),
    effortLevel: targetLevel,
    text: chosen,
  };
  return { clicked: chosen, effortIndex: items.indexOf(target) };
})();
