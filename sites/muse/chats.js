(() => {
  const limit = parseInt("{{args.limit}}", 10) || 15;
  // Structural: each thread row carries data-testid="hatch-thread-row" (main chat,
  // side chats and channels alike). index is the position in this list, and
  // 'muse open --index' uses the same numbering.
  const rows = Array.from(document.querySelectorAll('[data-testid="hatch-thread-row"]'));
  const out = [];

  for (const row of rows) {
    if (out.length >= limit) break;
    const lines = (row.innerText || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;
    out.push({
      index: out.length,
      title: lines[0],
      detail: lines.slice(1).join(" "),
      active: row.getAttribute("aria-current") === "page",
    });
  }

  return out;
})();
