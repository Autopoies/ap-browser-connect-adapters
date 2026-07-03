(() => {
  const rows = document.querySelectorAll('.crate-row');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const link = row.querySelector('a.name');
    const name = link?.textContent?.trim() || '';
    if (!name) return;
    const extractStat = (cls) => {
      const li = row.querySelector('.' + cls);
      if (!li) return '';
      const text = li.textContent.replace(/\s+/g, ' ').trim();
      return text.replace(/^All-Time\s*Downloads?\s*:?\s*/i, '').replace(/^Recent\s*Downloads?\s*:?\s*/i, '').trim();
    };
    out.push({
      name,
      version: row.querySelector('.version')?.textContent?.trim() || '',
      description: row.querySelector('.description')?.textContent?.replace(/\s+/g, ' ').trim() || '',
      url: link?.href ? link.href : '',
      downloads_total: extractStat('downloads'),
      downloads_recent: extractStat('recent-downloads'),
    });
  });
  return out;
})()
