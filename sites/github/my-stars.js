(() => {
  const links = [...document.querySelectorAll('h3 a')]
    .filter(a => a.textContent.includes('/'))
    .filter(a => a.href.startsWith('https://github.com/'))
    .filter(a => !a.href.includes('/stars'));
  const out = [];
  const seen = new Set();
  links.forEach(a => {
    if (out.length >= {{args.limit}}) return;
    if (seen.has(a.href)) return;
    seen.add(a.href);
    const repo = a.textContent.replace(/\s+/g, ' ').trim();
    out.push({ repo, url: a.href });
  });
  return out;
})()
