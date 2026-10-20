(() => {
  // Reads the switches in the "more tools" submenu (e.g. personalization).
  // Requires toggleOpen (see wait step). Labels are display text, returned as-is.
  const visible = (el) => el.getBoundingClientRect().height > 0;
  const switches = Array.from(document.querySelectorAll('button[role="switch"]')).filter(visible);
  const toggles = switches.map((sw, index) => {
    const host = sw.closest("personalization-toggle") || sw.closest("mat-slide-toggle") || sw.parentElement;
    return {
      index,
      id: host ? host.tagName.toLowerCase() : "",
      label: ((host && host.innerText) || "").trim().split("\n")[0] || "",
      checked: sw.getAttribute("aria-checked") === "true",
    };
  });
  window.__apMenus = Object.assign(window.__apMenus || {}, {
    moreTools: { toggles },
  });
  return { moreTools: { toggles } };
})();
