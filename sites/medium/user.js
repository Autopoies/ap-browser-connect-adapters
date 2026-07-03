(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('article').forEach((row) => {
    if (out.length >= {{args.limit}}) return;
    const title = row.querySelector('h2, h3')?.textContent?.trim() || '';
    if (!title) return;
    const links = Array.from(row.querySelectorAll('a'));
    const articleLink = links.find(a => a.href && /medium\.com\/.+\/[^/?#]+-[0-9a-f]{12}/.test(a.href)) || links.find(a => a.textContent?.includes(title));
    const url = articleLink?.href?.split('?')[0] || '';
    if (!url || seen.has(url)) return;
    seen.add(url);
    const subtitle = Array.from(row.querySelectorAll('h3, h4')).map(el => el.textContent?.trim() || '').find(text => text && text !== title) || '';
    const author = Array.from(row.querySelectorAll('a[href*="/@"]')).map(a => a.textContent?.trim() || '').find(Boolean) || '';
    out.push({ title, url, subtitle, author });
  });
  return out;
})()
