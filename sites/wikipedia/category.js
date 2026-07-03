(() => {
  const links = [...document.querySelectorAll('#mw-pages a[href*="/wiki/"]')]
    .filter(a => a.textContent.trim() && !a.textContent.startsWith('This list') && !a.href.includes('Wikipedia:FAQ'));
  const out = [];
  const seen = new Set();
  links.forEach(a => {
    if (out.length >= {{args.limit}}) return;
    if (seen.has(a.href)) return;
    seen.add(a.href);
    out.push({ title: a.textContent.trim(), url: a.href });
  });
  return out;
})()
