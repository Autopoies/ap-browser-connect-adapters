(() => {
  const out = [];
  const seen = new Set();
  const cards = document.querySelectorAll('article, .feed-row-wide, .feed-row, .z-feed-content, li, div');
  cards.forEach((row) => {
    if (out.length >= {{args.limit}}) return;
    const a = row.querySelector('a[href*="smzdm.com/p/"], a[href*="post.smzdm.com"], a[href^="http"]');
    const title = a?.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (title.length < 8) return;
    const url = a.href || '';
    if (!url || seen.has(url)) return;
    seen.add(url);
    const text = row.textContent?.replace(/\s+/g, ' ').trim() || '';
    const price = text.match(/\d+(?:\.\d+)?\s*元(?:（[^）]+）)?/)?.[0] || '';
    out.push({ title, price, url, meta: text.slice(0, 180) });
  });
  return out;
})()
