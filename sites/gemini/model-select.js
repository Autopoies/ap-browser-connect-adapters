(() => {
  // Synchronous: picks the model item in the already-open mode menu and clicks it.
  // Exact name match wins; otherwise the shortest name containing the substring.
  const rawIdx = "{{args.index}}";
  const targetIndex =
    rawIdx !== "" && rawIdx !== "null" && rawIdx !== "undefined" ? parseInt(rawIdx, 10) : -1;
  const targetName = "{{args.name}}".trim().toLowerCase();
  const lineOf = (el) => ((el.innerText || "").trim().split("\n")[0] || "").trim();
  const items = Array.from(document.querySelectorAll('gem-menu-item[data-test-id^="bard-mode-option-"]'));

  let target = null;
  if (targetIndex >= 0 && targetIndex < items.length) {
    target = items[targetIndex];
  } else if (targetName) {
    const exact = items.find((el) => lineOf(el).toLowerCase() === targetName);
    const partial = items
      .filter((el) => lineOf(el).toLowerCase().includes(targetName))
      .sort((a, b) => lineOf(a).length - lineOf(b).length);
    target = exact || partial[0] || null;
  }

  if (!target) {
    const toggle = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
    if (toggle && toggle.getAttribute("aria-expanded") === "true") toggle.click();
    window.__apSelect = {
      modelIndex: targetIndex,
      modelName: targetName,
      error: "target model not found in menu",
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
    modelIndex: items.indexOf(target),
    modelName: targetName,
    text: chosen,
  };
  return { clicked: chosen, modelIndex: items.indexOf(target) };
})();
