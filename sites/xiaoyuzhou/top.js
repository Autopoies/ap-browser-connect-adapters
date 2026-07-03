(() => {
  const out = [];
  document.querySelectorAll('a[href*="/podcast/"]').forEach((a) => {
    if (out.length >= {{args.limit}}) return;
    const title = a.textContent?.trim().split('\n')[0] || '';
    if (!title) return;
    out.push({ title, url: a.href });
  });
  return out;
})()
