(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href*="blog.sina.com.cn/m/"], a[href*="blog.sina.com.cn/u/"]').forEach((link) => {
    if (out.length >= {{args.limit}}) return;
    const title = link.textContent?.trim() || '';
    if (!title) return;
    const url = link.href || '';
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ title, url });
  });
  return out;
})()
