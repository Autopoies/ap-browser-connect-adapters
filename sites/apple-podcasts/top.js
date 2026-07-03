(() => {
  const seen = new Set();
  const out = [];
  const limit = {{args.limit}};
  [...document.querySelectorAll('a[href*="/podcast/"]')].forEach((a) => {
    if (out.length >= limit) return;
    const url = a.href || '';
    if (url.includes('?i=') || seen.has(url)) return;
    const title = a.getAttribute('aria-label')?.replace(/^Explicit,\s*/, '').trim() || a.textContent?.trim() || '';
    if (!title) return;
    seen.add(url);
    out.push({ rank: String(out.length + 1), title, url, podcast_id: (url.match(/id(\d+)/) || [])[1] || '' });
  });
  return out;
})()
