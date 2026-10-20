(() => {
  // Wait-step probe for send. Synchronous; the CLI polls it.
  const baseline = window.__apMuseSendBaseline || 0;
  const userTurns = document.querySelectorAll('[data-message-item][data-message-role="user"]').length;
  return { accepted: userTurns > baseline };
})();
