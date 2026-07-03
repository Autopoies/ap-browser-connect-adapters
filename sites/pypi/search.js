(() => {
  const items = document.querySelectorAll('a.package-snippet');
  const out = [];
  items.forEach((a, i) => {
    if (i >= {{args.limit}}) return;
    const name = a.querySelector('.package-snippet__name')?.textContent?.trim() || '';
    if (!name) return;
    const desc = a.querySelector('.package-snippet__description')?.textContent?.trim() || '';
    const updated = a.querySelector('time')?.getAttribute('datetime') || '';
    out.push({
      name,
      url: a.href,
      description: desc,
      updated,
    });
  });
  return out;
})()
