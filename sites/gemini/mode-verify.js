(() => {
  // Reads the tools currently selected in the composer (no menu needed) and
  // checks the clicked tool, or that nothing is selected after a clear.
  const sel = window.__apSelect || {};
  const selectedTools = Array.from(
    document.querySelectorAll('toolbox-drawer [data-test-id="deselect-drawer-item-gem-button"]'),
  ).map((el) => (el.innerText || "").trim()).filter((t) => t.length > 0);
  if (sel.error) {
    return { modeIndex: sel.modeIndex, modeName: sel.modeName, selected: false, error: sel.error, available: sel.available, selectedTools };
  }
  if (sel.cleared !== undefined) {
    return { cleared: sel.cleared, selected: selectedTools.length === 0, selectedTools };
  }
  return {
    modeIndex: sel.modeIndex,
    modeName: sel.modeName,
    selected: !!sel.text && selectedTools.includes(sel.text),
    text: sel.text,
    selectedTools,
  };
})();
