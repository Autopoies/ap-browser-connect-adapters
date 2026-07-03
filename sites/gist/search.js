(() => {
  const all = [...document.querySelectorAll('a[href]')]
    .filter(a => a.href.match(/gist\.github\.com\/[^/]+\/[a-f0-9]+$/) && a.textContent.trim())
    .filter(a => !/^\d+\s+files?$/.test(a.textContent.trim()));
  const out = [];
  const seen = new Set();
  all.forEach(a => {
    if (out.length >= {{args.limit}}) return;
    const match = a.href.match(/gist\.github\.com\/([^/]+)\/([a-f0-9]+)/);
    if (!match) return;
    const gistId = match[2];
    if (seen.has(gistId)) return;
    seen.add(gistId);
    out.push({
      gist_id: gistId,
      url: a.href,
      filename: a.textContent.trim(),
      author: match[1],
    });
  });
  return out;
})()
