(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('h3').forEach((h) => {
    if (out.length >= {{args.limit}}) return;
    const title = h.textContent?.trim() || '';
    if (!title) return;
    const link = h.closest('a') || h.parentElement?.closest('a');
    const url = link?.href || '';
    if (!url || seen.has(url) || !url.includes('reuters.com')) return;
    seen.add(url);
    const box = h.closest('div[data-sokoban-container], div.g, div') || h.parentElement;
    const summary = Array.from(box?.querySelectorAll('span') || []).map(s => s.textContent?.trim() || '').find(text => text && text !== title && text.length > 30) || '';
    const date = (summary.match(/\b[A-Z][a-z]+ \d{1,2}, \d{4}\b/) || [''])[0];
    out.push({ title, url, summary, date });
  });
  return out;
})()
