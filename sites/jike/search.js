(() => {
  if (/登录|验证码/.test(document.body?.innerText || '') && !document.querySelector('a[href*="/originalPosts/"]')) return [];
  const out = [];
  document.querySelectorAll('a[href], article, [role="article"]').forEach((row) => {
    if (out.length >= {{args.limit}}) return;
    const a = row.matches?.('a[href]') ? row : row.querySelector?.('a[href]');
    const text = row.textContent?.replace(/\s+/g, ' ').trim() || '';
    const title = text.slice(0, 80);
    if (title.length < 6) return;
    out.push({ title, url: a?.href || location.href, text: text.slice(0, 240) });
  });
  return out;
})()
