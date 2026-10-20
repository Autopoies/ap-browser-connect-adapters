(() => {
  // Language-agnostic: data-message-* attributes, data-hatch-* hooks and
  // data-testid values only. No text matching.
  const streamingNode = document.querySelector('[data-hatch-markdown-streaming="true"]');
  const assistants = Array.from(
    document.querySelectorAll('[data-message-item][data-message-role="assistant"]'),
  );
  const users = Array.from(
    document.querySelectorAll('[data-message-item][data-message-role="user"]'),
  );
  const lastUser = users[users.length - 1] || null;
  const lastAssistant = assistants[assistants.length - 1] || null;

  // A user message with no assistant message after it means the reply is
  // still pending (covers the gap between submit and the first streamed token).
  const awaitingReply =
    !!lastUser &&
    (!lastAssistant ||
      (lastUser.compareDocumentPosition(lastAssistant) &
        Node.DOCUMENT_POSITION_PRECEDING) !== 0);

  const isGenerating = !!streamingNode || awaitingReply;
  // settled: a reply exists after the last user message and nothing is streaming.
  // Unlike !isGenerating, an empty message list (transient re-render) is NOT settled.
  const settled =
    !!lastUser && !!lastAssistant && !streamingNode &&
    (lastUser.compareDocumentPosition(lastAssistant) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  const body = lastAssistant
    ? lastAssistant.querySelector("[data-hatch-assistant-message-body]") || lastAssistant
    : null;

  return {
    isGenerating,
    settled,
    currentActivity: isGenerating ? "generating" : null,
    awaitingReply,
    responseCount: assistants.length,
    userTurnCount: users.length,
    lastResponseLength: body ? (body.innerText || "").trim().length : 0,
  };
})();
