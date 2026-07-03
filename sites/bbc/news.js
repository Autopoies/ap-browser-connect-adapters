(() => {
  const heads = document.querySelectorAll('[data-testid="card-headline"]');
  const out = [];
  const seen = new Set();
  heads.forEach((h, i) => {
    if (i >= {{args.limit}}) return;
    const title = h.textContent.trim();
    if (!title) return;
    const link = h.closest('a');
    const url = link?.href || '';
    if (seen.has(url)) return;
    seen.add(url);
    out.push({ title, url });
  });
  return out;
})()
