(() => {
  const limit = parseInt("{{args.limit}}", 10) || 15;
  // Structural: conversation links live inside the conversations list and
  // point at /app/<id>. No text matching.
  const links = Array.from(
    document.querySelectorAll('conversations-list a[href^="/app/"]'),
  );
  const seen = new Set();
  const out = [];

  for (const a of links) {
    if (out.length >= limit) break;
    const url = new URL(a.getAttribute("href"), location.origin).href;
    if (seen.has(url)) continue;
    const title = ((a.innerText || "").trim().split("\n")[0] || "").trim();
    if (!title) continue;
    seen.add(url);
    out.push({ title, url });
  }

  return out;
})();
