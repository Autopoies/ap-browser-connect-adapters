(() => {
  if (document.body?.innerText?.includes('找不到了')) return [];
  const out = [];
  document.querySelectorAll('a[href*="/podcast/"]').forEach((a) => {
    if (out.length >= {{args.limit}}) return;
    const title = a.querySelector('.title')?.textContent?.trim() || a.textContent?.trim().split('\n')[0] || '';
    if (!title) return;
    out.push({ title, url: a.href, description: a.querySelector('.description')?.textContent?.trim() || '' });
  });
  return out;
})()
