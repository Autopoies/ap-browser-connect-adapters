(() => {
  // Reads the model list from the open mode menu. Requires modeOpen (see wait step).
  const lineOf = (el) => ((el.innerText || "").trim().split("\n")[0] || "").trim();
  const items = Array.from(
    document.querySelectorAll('gem-menu-item[data-test-id^="bard-mode-option-"]'),
  );
  if (items.length === 0) return { error: "model menu not open" };
  const models = items
    .map((el, index) => {
      const lines = (el.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean);
      return {
        index,
        id: (el.getAttribute("data-test-id") || "").replace("bard-mode-option-", ""),
        name: lines[0] || "",
        description: lines.slice(1).join(" "),
        selected: el.classList.contains("selected"),
      };
    })
    .filter((m) => m.name.length > 0);
  window.__apMenus = Object.assign(window.__apMenus || {}, {
    models: { current: (models.find((m) => m.selected) || {}).name || "default", items: models },
  });
  return { models: window.__apMenus.models };
})();
