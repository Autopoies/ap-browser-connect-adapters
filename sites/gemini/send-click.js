(() => {
  // Clicks the send button once. The inner <button> of gem-icon-button.send-button
  // is the clickable element; the host only carries state classes.
  const st = window.__apGeminiSend || (window.__apGeminiSend = {});
  const host = document.querySelector(".send-button");
  const btn = host ? host.querySelector("button") : null;
  const text = ((document.querySelector("rich-textarea div.ql-editor") || {}).innerText || "").trim();
  if (!btn || btn.disabled || text.length === 0) {
    return { clicked: false, reason: "send button not ready" };
  }
  btn.click();
  st.clicks = (st.clicks || 0) + 1;
  return { clicked: true, clicks: st.clicks };
})();
