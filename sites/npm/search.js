(() => {
  const sections = document.querySelectorAll('section');
  const out = [];
  sections.forEach((s, i) => {
    if (i >= {{args.limit}}) return;
    const link = s.querySelector('a[href*="/package/"]');
    const name = link?.querySelector('h3, h2')?.textContent?.trim() || link?.textContent?.trim() || '';
    if (!name || name === 'Search packages') return;
    const text = s.textContent.replace(/\s+/g, ' ').trim();
    const version = (text.match(/•\s*([\d.]+)\s*•/) || [])[1] || '';
    const desc = s.querySelector('p')?.textContent?.trim() || '';
    out.push({
      name,
      url: link?.href || '',
      description: desc,
      version,
    });
  });
  return out;
})()
