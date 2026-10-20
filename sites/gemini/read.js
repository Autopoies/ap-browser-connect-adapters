(async () => {
  const roleAttr = "{{args.role}}";
  const index = parseInt("{{args.index}}", 10);
  const maxWaitMs = (parseInt("{{args.wait}}", 10) || 0) * 1000;
  const startTime = Date.now();

  // Same language-agnostic state detection as status.js.
  function getState() {
    const busyNode = document.querySelector('.markdown[aria-busy="true"]');
    const responses = Array.from(document.querySelectorAll("model-response"));
    const queries = Array.from(document.querySelectorAll("user-query"));
    const lastQuery = queries[queries.length - 1] || null;
    const lastResponse = responses[responses.length - 1] || null;
    const awaitingReply =
      !!lastQuery &&
      (!lastResponse ||
        (lastQuery.compareDocumentPosition(lastResponse) &
          Node.DOCUMENT_POSITION_PRECEDING) !== 0);
    const isGenerating = !!busyNode || awaitingReply;
    return {
      isGenerating,
      currentActivity: isGenerating ? "generating" : null,
      awaitingReply,
      responseCount: responses.length,
      userTurnCount: queries.length,
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

  let items;
  if (roleAttr === "assistant") {
    items = Array.from(document.querySelectorAll("model-response"));
  } else if (roleAttr === "user") {
    items = Array.from(document.querySelectorAll("user-query"));
  } else {
    items = Array.from(document.querySelectorAll("user-query, model-response"));
  }

  if (items.length === 0) {
    return { turnIndex: -1, role: roleAttr, length: 0, content: "", status: state };
  }

  // User turns: the visible text lives in .query-text-line; the screen-reader
  // label next to it is a .cdk-visually-hidden h5 and is intentionally skipped.
  // Model turns: the rendered answer lives in .markdown.
  const textOf = (el) => {
    if (el.tagName.toLowerCase() === "user-query") {
      const lines = Array.from(el.querySelectorAll(".query-text-line"))
        .map((p) => (p.textContent || "").trim())
        .filter(Boolean);
      return lines.length > 0 ? lines.join("\n") : (el.innerText || "").trim();
    }
    const md = el.querySelector(".markdown");
    return ((md || el).innerText || "").trim();
  };
  const roleOf = (el) => (el.tagName.toLowerCase() === "user-query" ? "user" : "assistant");

  let targetIdx = index < 0 ? items.length + index : index;
  if (targetIdx < 0) targetIdx = 0;
  if (targetIdx >= items.length) targetIdx = items.length - 1;

  const targetEl = items[targetIdx];
  const text = targetEl ? textOf(targetEl) : "";

  return {
    turnIndex: targetIdx,
    role: roleAttr === "all" ? roleOf(targetEl) : roleAttr,
    length: text.length,
    content: text,
    status: state,
  };
})();
