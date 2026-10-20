(async () => {
  // Fails loudly if the route never switched to an empty side chat.
  const onNewThread = location.pathname.startsWith("/thread/new");
  const userTurns = document.querySelectorAll('[data-message-item][data-message-role="user"]').length;
  if (onNewThread && userTurns === 0) return { created: true, url: location.pathname };
  throw Object.assign(
    new Error("new side chat not opened (route " + location.pathname + ", " + userTurns + " user turns)"),
    { code: "SIDE_NOT_OPENED" },
  );
})();
