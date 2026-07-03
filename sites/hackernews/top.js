(() => {
  const rows = document.querySelectorAll('.athing');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const titleEl = row.querySelector('.titleline a');
    const subtext = row.nextElementSibling?.querySelector('.subtext');
    out.push({
      rank: i + 1,
      title: titleEl?.textContent?.trim() || '',
      url: titleEl?.href || '',
      points: subtext?.querySelector('.score')?.textContent?.trim() || '',
      comments: [...(subtext?.querySelectorAll('a') || [])].find(a => /comments|discuss/i.test(a.textContent))?.textContent?.trim() || '',
    });
  });
  return out;
})()
