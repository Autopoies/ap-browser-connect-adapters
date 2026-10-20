(() => {
  const m = (window.__apMenus || {}).models;
  if (!m) return { currentModel: "default", models: [], error: "model menu not read" };
  return { currentModel: m.current || "default", models: m.items };
})();
