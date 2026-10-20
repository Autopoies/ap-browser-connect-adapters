(() => {
  // Ready once the empty new side chat route is active (SPA route, no reload).
  const onNewThread = location.pathname.startsWith("/thread/new");
  const userTurns = document.querySelectorAll('[data-message-item][data-message-role="user"]').length;
  return { newThread: onNewThread && userTurns === 0, url: location.pathname };
})();
