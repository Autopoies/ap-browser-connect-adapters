(() => {
  const rows = document.querySelectorAll('tr.item');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const link = row.querySelector('a.nbg, a[href*="/subject/"]');
    const title = link?.getAttribute('title') || link?.textContent?.trim() || '';
    if (!title) return;
    const desc = row.querySelector('p')?.textContent?.trim() || '';
    out.push({
      title,
      url: link?.href || '',
      meta: desc.slice(0, 300),
    });
  });
  return out;
})()
