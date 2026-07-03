(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href*="/read/"]').forEach((link) => {
    if (out.length >= {{args.limit}}) return;
    const title = link.textContent?.trim() || '';
    if (!title) return;
    const url = link.href || '';
    if (!url || seen.has(url)) return;
    seen.add(url);
    const card = link.closest('article, div') || link.parentElement;
    const text = card?.innerText?.trim() || '';
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    const source = lines.find(s => s !== title && !/ago$|^\d/.test(s)) || '';
    const time = lines.find(s => /ago$|^\d+\s/.test(s)) || '';
    out.push({ title, url, source, time });
  });
  return out;
})()
