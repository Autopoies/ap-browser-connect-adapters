(() => {
  // Wait-step probe for send. Synchronous; the CLI polls it.
  const st = window.__apGeminiSend || {};
  const modeToggle = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
  const uploadToggle = Array.from(
    document.querySelectorAll('input-container button[aria-haspopup="menu"]'),
  ).find((b) => !b.getAttribute("data-test-id"));
  const modeExpanded = !!modeToggle && modeToggle.getAttribute("aria-expanded") === "true";
  const uploadExpanded = !!uploadToggle && uploadToggle.getAttribute("aria-expanded") === "true";
  const visiblePanes = Array.from(document.querySelectorAll(".cdk-overlay-pane"))
    .filter((p) => p.getBoundingClientRect().height > 0).length;
  const modelOptions = document.querySelectorAll('gem-menu-item[data-test-id^="bard-mode-option-"]').length;
  const host = document.querySelector(".send-button");
  const btn = host ? host.querySelector("button") : null;
  const text = ((document.querySelector("rich-textarea div.ql-editor") || {}).innerText || "").trim();
  const baseline = window.__apGeminiSendBaseline || 0;
  return {
    modelReady: st.wantsModel ? (modeExpanded && modelOptions > 0) : true,
    menusClosed: !modeExpanded && !uploadExpanded && visiblePanes === 0,
    canSend: !!host && host.classList.contains("has-input") && !!btn && !btn.disabled && text.length > 0,
    accepted: document.querySelectorAll("user-query").length > baseline,
  };
})();
