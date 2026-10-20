(() => {
  // Capture the user-message baseline before typing; send-verify.js accepts
  // only a user message beyond this count.
  window.__apMuseSendBaseline = document.querySelectorAll(
    '[data-message-item][data-message-role="user"]',
  ).length;
  return { prepared: true };
})();
