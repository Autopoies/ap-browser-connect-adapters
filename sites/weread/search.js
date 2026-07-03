(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href*="/web/reader/"], a[href*="bookDetail"], .bookInfo, li').forEach((row) => {
    if (out.length >= {{args.limit}}) return;
    const a = row.matches?.('a[href]') ? row : row.querySelector?.('a[href]');
    const box = row.matches?.('a[href]') ? (row.closest('li, .bookInfo, div') || row) : row;
    const lines = (box.textContent || '').split('\n').map((s) => s.trim()).filter((s) => s && !/^\d+$/.test(s));
    const title = box.querySelector?.('.title, .bookInfo_title, h3')?.textContent?.trim() || lines[0] || '';
    if (!title || title.length < 2) return;
    const url = a?.href || location.href;
    if (seen.has(title + url)) return;
    seen.add(title + url);
    const author = box.querySelector?.('.author, .bookInfo_author')?.textContent?.trim() || lines[1] || '';
    out.push({ title, author, url });
  });
  return out;
})()
