(() => {
  const links = Array.from(document.querySelectorAll('a[href*="/c/"], a[href*="/g/"]'));
  const seen = new Set();
  const out = [];

  for (const l of links) {
    if (out.length >= {{args.limit}}) break;
    const title = (l.innerText || '').trim().replace(/\n/g, ' ');
    const url = l.href || '';
    if (!title || !url || seen.has(url)) continue;
    seen.add(url);
    out.push({ title, url });
  }

  return out;
})()
