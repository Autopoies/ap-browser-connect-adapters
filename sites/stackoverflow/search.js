(() => {
  const rows = document.querySelectorAll('.s-post-summary');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const link = row.querySelector('.s-post-summary--content-title a, h3 a');
    const title = link?.textContent?.trim() || '';
    if (!title) return;
    const stats = [...row.querySelectorAll('.s-post-summary--stats-item')];
    const statNum = (n) => stats[n]?.querySelector('.s-post-summary--stats-item-number')?.textContent?.trim() || '';
    out.push({
      title,
      url: link?.href || '',
      excerpt: row.querySelector('.s-post-summary--content-excerpt')?.textContent?.trim()?.slice(0, 200) || '',
      votes: statNum(0),
      answers: statNum(1),
      views: statNum(2),
      tags: [...row.querySelectorAll('.s-tag')].map(t => t.textContent.trim()),
    });
  });
  return out;
})()
