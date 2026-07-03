(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href]').forEach((a) => {
    if (out.length >= {{args.limit}}) return;
    const title = a.textContent?.replace(/\s+/g, ' ').trim() || '';
    const url = a.href || '';
    if (title.length < 2 || seen.has(url)) return;
    if (!/xueqiu\.com\/(S|k|hq|status)/.test(url)) return;
    seen.add(url);
    out.push({ title, url });
  });
  return out;
})()
