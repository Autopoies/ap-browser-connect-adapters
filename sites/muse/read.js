(async () => {
  const roleAttr = "{{args.role}}";
  const index = parseInt("{{args.index}}", 10);
  const maxWaitMs = (parseInt("{{args.wait}}", 10) || 0) * 1000;
  const startTime = Date.now();

  // Same language-agnostic state detection as status.js.
  function getState() {
    const streamingNode = document.querySelector('[data-hatch-markdown-streaming="true"]');
    const assistants = Array.from(
      document.querySelectorAll('[data-message-item][data-message-role="assistant"]'),
    );
    const users = Array.from(
      document.querySelectorAll('[data-message-item][data-message-role="user"]'),
    );
    const lastUser = users[users.length - 1] || null;
    const lastAssistant = assistants[assistants.length - 1] || null;
    const awaitingReply =
      !!lastUser &&
      (!lastAssistant ||
        (lastUser.compareDocumentPosition(lastAssistant) &
          Node.DOCUMENT_POSITION_PRECEDING) !== 0);
    const isGenerating = !!streamingNode || awaitingReply;
    return {
      isGenerating,
      currentActivity: isGenerating ? "generating" : null,
      awaitingReply,
      responseCount: assistants.length,
      userTurnCount: users.length,
    };
  }

  let state = getState();
  while (
    maxWaitMs > 0 &&
    state.isGenerating &&
    Date.now() - startTime < maxWaitMs
  ) {
    await new Promise((r) => setTimeout(r, 1000));
    state = getState();
  }

  let selector;
  if (roleAttr === "assistant") {
    selector = '[data-message-item][data-message-role="assistant"]';
  } else if (roleAttr === "user") {
    selector = '[data-message-item][data-message-role="user"]';
  } else {
    selector = "[data-message-item][data-message-role]";
  }
  const items = Array.from(document.querySelectorAll(selector));

  if (items.length === 0) {
    return { turnIndex: -1, role: roleAttr, length: 0, content: "", status: state };
  }

  // Assistant: the rendered body. User: the message text with screen-reader
  // labels (.sr-only) removed, so no localized prefix leaks into the content.
  const textOf = (el) => {
    if (el.getAttribute("data-message-role") === "assistant") {
      const body = el.querySelector("[data-hatch-assistant-message-body]") || el;
      return (body.innerText || "").trim();
    }
    const clone = el.cloneNode(true);
    clone.querySelectorAll(".sr-only").forEach((n) => n.remove());
    return (clone.textContent || "").trim();
  };

  let targetIdx = index < 0 ? items.length + index : index;
  if (targetIdx < 0) targetIdx = 0;
  if (targetIdx >= items.length) targetIdx = items.length - 1;

  const targetEl = items[targetIdx];
  const text = targetEl ? textOf(targetEl) : "";

  return {
    turnIndex: targetIdx,
    role: roleAttr === "all" ? targetEl.getAttribute("data-message-role") : roleAttr,
    length: text.length,
    content: text,
    status: state,
  };
})();
