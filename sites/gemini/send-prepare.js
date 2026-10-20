(() => {
  // Before typing: capture the user-turn baseline used by send-verify.js, and
  // record whether a model was requested. When one was, open the model menu
  // (JS click, no timers); send-model.js then picks the model.
  window.__apGeminiSendBaseline = document.querySelectorAll("user-query").length;
  const model = "{{args.model}}".trim();
  window.__apGeminiSend = { wantsModel: model !== "", model, modelSelected: null, modelError: null, clicks: 0 };
  if (model !== "") {
    const toggle = document.querySelector('button[data-test-id="bard-mode-menu-button"]');
    if (!toggle) {
      window.__apGeminiSend.modelError = "model menu button not found";
    } else if (toggle.getAttribute("aria-expanded") !== "true") {
      toggle.click();
    }
  }
  return { prepared: true, model: model || "default" };
})();
