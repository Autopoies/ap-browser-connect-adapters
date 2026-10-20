(async () => {
  // Fails if the requested thread did not become active. Read-only check.
  const st = window.__apOpen || {};
  const active = Array.from(document.querySelectorAll('[data-testid="hatch-thread-row"][aria-current="page"]'))
    .map((r) => ((r.innerText || "").trim().split("\n")[0] || "").trim());
  if (!st.title || !active.includes(st.title)) {
    throw Object.assign(
      new Error("thread did not open: " + (st.title || "(unknown)") + "; active: " + active.join(" | ")),
      { code: "THREAD_NOT_OPENED" },
    );
  }
  return {
    opened: true,
    thread: st.title,
    index: st.index,
    path: location.pathname,
    readOnly: !!document.querySelector('[data-testid="hatch-channel-read-only-notice"]'),
    messageCount: document.querySelectorAll("[data-message-item]").length,
  };
})();
