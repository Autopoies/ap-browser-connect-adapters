(() => {
  // Final step of the menus command: return everything read so far.
  const m = window.__apMenus || {};
  return {
    models: m.models || null,
    efforts: m.efforts || null,
    tools: m.tools || null,
    upload: m.upload || null,
    moreTools: m.moreTools || null,
  };
})();
