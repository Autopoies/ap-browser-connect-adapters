(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href*="/news/articles/"]').forEach((link) => {
    if (out.length >= {{args.limit}}) return;
    const title = link.textContent?.trim() || '';
    if (!title || title.includes('/Bloomberg')) return;
    const url = link.href?.split('?')[0] || '';
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ title, url, section: '{{args.section}}' });
  });
  return out;
})()
