(() => {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const out = [];
  const seen = new Set();
  document.querySelectorAll('article a[href*="/p/"], article a[href*="/reel/"], main a[href*="/p/"], main a[href*="/reel/"]').forEach(link => {
    if (out.length >= {{args.limit}}) return;
    const key = link.href.split('?')[0];
    if (seen.has(key)) return;
    seen.add(key);
    const img = link.querySelector('img');
    out.push({ type: key.includes('/reel/') ? 'reel' : 'post', url: link.href, thumbnail: img?.src || '', text: clean(img?.alt || link.textContent) });
  });
  return out;
})()
