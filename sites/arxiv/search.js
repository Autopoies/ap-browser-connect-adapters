(() => {
  const rows = document.querySelectorAll('.arxiv-result');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const title = row.querySelector('p.title')?.textContent?.trim() || '';
    if (!title) return;
    const idText = row.querySelector('p.list-title')?.textContent || '';
    const arxivId = (idText.match(/arXiv:\s*([\d.]+)/) || [])[1] || '';
    const authors = row.querySelector('.authors')?.textContent?.replace(/[\s\S]*?Authors:\s*/, '').replace(/\s+/g, ' ').trim() || '';
    const abstract = row.querySelector('.abstract')?.textContent?.replace(/[\s\S]*?Abstract:\s*/, '').replace(/\s+/g, ' ').trim() || '';
    const subjects = [...row.querySelectorAll('.primary-subject, .tags .tag')].map(t => t.textContent.trim());
    out.push({
      arxiv_id: arxivId,
      title,
      url: row.querySelector(`a[href*="/abs/${arxivId}"]`)?.href || '',
      authors,
      abstract: abstract.slice(0, 400),
      subjects,
    });
  });
  return out;
})()
