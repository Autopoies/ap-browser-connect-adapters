(() => {
  // One retry, and only when the first click demonstrably did not take: no new
  // user turn yet AND the prompt is still in the composer. A submitted prompt has
  // left the composer, so this cannot double-send.
  const st = window.__apGeminiSend || (window.__apGeminiSend = {});
  const baseline = window.__apGeminiSendBaseline || 0;
  if (document.querySelectorAll("user-query").length > baseline) return { retried: false, reason: "already accepted" };
  const host = document.querySelector(".send-button");
  const btn = host ? host.querySelector("button") : null;
  const text = ((document.querySelector("rich-textarea div.ql-editor") || {}).innerText || "").trim();
  if (!btn || btn.disabled || text.length === 0) {
    return { retried: false, reason: "composer empty or send not ready" };
  }
  btn.click();
  st.clicks = (st.clicks || 0) + 1;
  return { retried: true, clicks: st.clicks };
})();
