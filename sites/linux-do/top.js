(() => {
  const rows = document.querySelectorAll('tr.topic-list-item');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const title_a = row.querySelector('a.title.raw-link, a.title');
    const title = title_a?.textContent?.trim() || '';
    if (!title) return;
    out.push({
      title,
      url: title_a?.href || '',
      category: row.querySelector('.badge-category .category-name')?.textContent?.trim() || '',
      replies: row.querySelector('.posts-map')?.textContent?.trim() || '',
      views: row.querySelector('.views')?.textContent?.trim() || '',
      activity: row.querySelector('.activity')?.textContent?.trim() || '',
    });
  });
  return out;
})()
