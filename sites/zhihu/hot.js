(() => {
  const items = document.querySelectorAll('.HotItem');
  const out = [];
  items.forEach((item, i) => {
    if (i >= {{args.limit}}) return;
    const title = item.querySelector('.HotItem-title')?.textContent?.trim() || '';
    if (!title) return;
    const metrics = item.querySelector('.HotItem-metrics');
    const heat = metrics ? metrics.textContent.replace(/分享.*$/, '').trim() : '';
    const link = item.querySelector('.HotItem-content a[href*="/question/"], a[href*="/question/"]');
    out.push({
      rank: parseInt(item.querySelector('.HotItem-rank')?.textContent?.trim() || (i + 1), 10),
      title,
      url: link?.href || '',
      heat,
      excerpt: item.querySelector('.HotItem-excerpt')?.textContent?.trim() || '',
      tag: item.querySelector('.HotItem-label')?.textContent?.trim() || '',
    });
  });
  return out;
})()
