(() => {
  const articles = document.querySelectorAll('main article');
  const out = [];
  const seen = new Set();
  articles.forEach(a => {
    if (out.length >= {{args.limit}}) return;
    const link = a.querySelector('a[href*="dev.to"]');
    const title = a.querySelector('h2, .crayons-story__title, [id^="article-link-"]')?.textContent?.trim() || '';
    if (!title || seen.has(title)) return;
    seen.add(title);
    out.push({
      title,
      url: link?.href || '',
      tags: [...a.querySelectorAll('.crayons-tag')].map(t => t.textContent.trim().replace(/^#/, '')),
    });
  });
  return out;
})()
