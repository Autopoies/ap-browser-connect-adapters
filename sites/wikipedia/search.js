(() => {
  const rows = document.querySelectorAll('ul.mw-search-results > li');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const heading = row.querySelector('.mw-search-result-heading a');
    const desc = row.querySelector('.searchresult');
    const data = row.querySelector('.mw-search-result-data');
    const title = heading?.textContent?.trim() || '';
    if (!title) return;
    out.push({
      title,
      url: heading?.href || '',
      description: desc?.textContent?.trim() || '',
      meta: data?.textContent?.trim() || '',
    });
  });
  return out;
})()
