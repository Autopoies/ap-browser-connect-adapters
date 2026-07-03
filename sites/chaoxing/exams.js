(() => {
  const body = document.body?.innerText || '';
  if (/登录|手机号|验证码|密码/.test(body) && body.length < 1000) return [];
  const out = [];
  document.querySelectorAll('a[href], li, tr').forEach((row) => {
    if (out.length >= {{args.limit}}) return;
    const text = row.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (!/考试|测验|待考|已考/.test(text)) return;
    const a = row.matches?.('a[href]') ? row : row.querySelector?.('a[href]');
    const title = text.slice(0, 100);
    if (!title) return;
    out.push({ title, url: a?.href || location.href, status: /已考|完成/.test(text) ? 'done' : (/待|未/.test(text) ? 'pending' : '') });
  });
  return out;
})()
