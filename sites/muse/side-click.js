(() => {
  // Starts a new side chat ("新旁聊"). In muse a side chat IS the new conversation:
  // there is no separate new-chat concept. Idempotent: if an empty new side chat is
  // already open, nothing is clicked. Structural hook: data-testid="hatch-chat-compose".
  const onNewThread = location.pathname.startsWith("/thread/new") &&
    document.querySelectorAll('[data-message-item][data-message-role="user"]').length === 0;
  if (onNewThread) return { clicked: false, reason: "already in an empty side chat" };
  const btn = document.querySelector('[data-testid="hatch-chat-compose"]');
  if (!btn) return { clicked: false, error: "new side chat button not found" };
  btn.click();
  return { clicked: true };
})();
