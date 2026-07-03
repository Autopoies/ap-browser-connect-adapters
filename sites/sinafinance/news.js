(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href]').forEach((a) => {
    if (out.length >= {{args.limit}}) return;
    const title = a.textContent?.replace(/\s+/g, ' ').trim() || '';
    const url = a.href || '';
    if (title.length < 8 || !/^https?:\/\//.test(url) || seen.has(url)) return;
    if (!/(finance\.sina|cj\.sina|video\.sina)/.test(url)) return;
    seen.add(url);
    out.push({ title, url });
  });
  return out;
})()
