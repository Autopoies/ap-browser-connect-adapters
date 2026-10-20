(async () => {
  // Accepting signal: a user message beyond the send-prepare.js baseline. Synchronous;
  // the waiting happens in the wait step of send.yaml. Enter is never re-pressed.
  const baseline = window.__apMuseSendBaseline || 0;
  const userTurns = document.querySelectorAll('[data-message-item][data-message-role="user"]').length;
  if (userTurns > baseline) return { sent: true, submitted: true, userTurns };
  throw Object.assign(
    new Error("submission not observed (no new user message after Enter)"),
    { code: "SEND_NOT_SUBMITTED" },
  );
})();
