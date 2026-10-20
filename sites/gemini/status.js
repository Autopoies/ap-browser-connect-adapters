(() => {
  // Language-agnostic: custom element tags, data-test-ids, classes and ARIA
  // state only. No text matching (UI strings are localized).
  const busyNode = document.querySelector('.markdown[aria-busy="true"]');
  const responses = Array.from(document.querySelectorAll("model-response"));
  const queries = Array.from(document.querySelectorAll("user-query"));
  const lastQuery = queries[queries.length - 1] || null;
  const lastResponse = responses[responses.length - 1] || null;

  // A user turn with no model reply after it means the reply is still pending
  // (covers the gap between submit and the first streamed token).
  const awaitingReply =
    !!lastQuery &&
    (!lastResponse ||
      (lastQuery.compareDocumentPosition(lastResponse) &
        Node.DOCUMENT_POSITION_PRECEDING) !== 0);

  const isGenerating = !!busyNode || awaitingReply;
  const lastMarkdown = lastResponse ? lastResponse.querySelector(".markdown") : null;

  return {
    isGenerating,
    currentActivity: isGenerating ? "generating" : null,
    awaitingReply,
    responseCount: responses.length,
    userTurnCount: queries.length,
    lastResponseLength: lastMarkdown ? (lastMarkdown.innerText || "").trim().length : 0,
  };
})();
