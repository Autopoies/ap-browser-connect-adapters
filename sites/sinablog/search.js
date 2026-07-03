(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href*="k.sina.com.cn"], a[href*="blog.sina.com.cn"]').forEach((link) => {
    if (out.length >= {{args.limit}}) return;
    const title = link.textContent?.trim() || '';
    if (!title) return;
    const url = link.href || '';
    if (!url || seen.has(url) || /sina\.com\.cn\/$|contactus|copyright|beian|signup|help/.test(url)) return;
    seen.add(url);
    const text = link.parentElement?.innerText?.trim() || '';
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    const source = lines.find(s => s !== title && !/^\d/.test(s)) || '';
    const time = lines.find(s => /\d{4}-\d{2}-\d{2}|\d+分钟前|\d+小时前/.test(s)) || '';
    out.push({ title, url, source, time });
  });
  return out;
})()
