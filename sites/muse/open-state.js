(() => {
  // Ready once the requested row is the active thread (aria-current="page").
  const st = window.__apOpen || {};
  const active = Array.from(document.querySelectorAll('[data-testid="hatch-thread-row"][aria-current="page"]'))
    .map((r) => ((r.innerText || "").trim().split("\n")[0] || "").trim());
  return { opened: !!st.title && active.includes(st.title), activeTitles: active };
})();
