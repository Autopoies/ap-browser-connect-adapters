(() => {
  // Picks the requested model in the open model menu. No-op when no model was
  // requested. Exact name wins; otherwise the shortest name containing the substring.
  const st = window.__apGeminiSend || (window.__apGeminiSend = {});
  if (!st.wantsModel) return { modelSelected: null };
  const lineOf = (el) => ((el.innerText || "").trim().split("\n")[0] || "").trim();
  const items = Array.from(document.querySelectorAll('gem-menu-item[data-test-id^="bard-mode-option-"]'));
  const needle = st.model.toLowerCase();
  const exact = items.find((el) => lineOf(el).toLowerCase() === needle);
  const partial = items
    .filter((el) => lineOf(el).toLowerCase().includes(needle))
    .sort((a, b) => lineOf(a).length - lineOf(b).length);
  const target = exact || partial[0] || null;

  if (!target) {
    const toggle = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
    if (toggle && toggle.getAttribute("aria-expanded") === "true") toggle.click();
    st.modelSelected = false;
    st.modelError = "model not found in menu";
    st.available = items.map(lineOf);
    return { modelSelected: false, error: st.modelError, available: st.available };
  }

  for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
    const Ctor = type.startsWith("pointer") ? PointerEvent : MouseEvent;
    target.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, button: 0, buttons: 1 }));
  }
  st.modelSelected = true;
  st.modelName = lineOf(target);
  return { modelSelected: true, model: st.modelName };
})();
