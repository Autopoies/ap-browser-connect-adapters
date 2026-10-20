(() => {
  // Compares the clicked model with the model read back from the menu.
  const sel = window.__apSelect || {};
  const current = ((window.__apMenus || {}).models || {}).current || null;
  if (sel.error) {
    return { modelIndex: sel.modelIndex, modelName: sel.modelName, selected: false, error: sel.error, available: sel.available, currentModel: current };
  }
  return {
    modelIndex: sel.modelIndex,
    modelName: sel.modelName,
    selected: !!sel.text && current === sel.text,
    text: sel.text,
    currentModel: current,
  };
})();
