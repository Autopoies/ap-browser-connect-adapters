(async () => {
  // Accepting signal: a new <user-query> past the baseline. Synchronous; the
  // waiting happens in the wait steps of send.yaml.
  const baseline = window.__apGeminiSendBaseline || 0;
  const userTurns = document.querySelectorAll("user-query").length;
  const st = window.__apGeminiSend || {};
  if (userTurns > baseline) {
    return { sent: true, submitted: true, userTurns, modelSelected: st.wantsModel ? st.modelSelected === true : null };
  }
  throw Object.assign(
    new Error("submission not observed (no new user turn after send and retry)"),
    { code: "SEND_NOT_SUBMITTED" },
  );
})();
