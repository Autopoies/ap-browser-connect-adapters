(() => {
  // Compares the clicked level with the level read back from the submenu.
  const sel = window.__apSelect || {};
  const current = ((window.__apMenus || {}).efforts || {}).current || null;
  if (sel.error) {
    return { effortIndex: sel.effortIndex, effortLevel: sel.effortLevel, selected: false, error: sel.error, available: sel.available, currentEffort: current };
  }
  return {
    effortIndex: sel.effortIndex,
    effortLevel: sel.effortLevel,
    selected: !!sel.text && current === sel.text,
    text: sel.text,
    currentEffort: current,
  };
})();
