(() => {
  const rows = document.querySelectorAll('article.Box-row');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const link = row.querySelector('h2.lh-condensed a');
    const repo = link?.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (!repo) return;
    const starsTotal = row.querySelector('a[href$="/stargazers"]')?.textContent?.trim() || '';
    const forks = row.querySelector('a[href$="/forks"]')?.textContent?.trim() || '';
    const starsPeriod = [...row.querySelectorAll('span, a')]
      .map(el => el.textContent.trim())
      .find(t => /stars?\s+(today|this\s+week|this\s+month)/i.test(t)) || '';
    out.push({
      repo,
      url: link?.href || '',
      description: row.querySelector('p')?.textContent?.trim() || '',
      language: row.querySelector('[itemprop="programmingLanguage"]')?.textContent?.trim() || '',
      stars_total: starsTotal,
      forks,
      stars_period: starsPeriod,
    });
  });
  return out;
})()
