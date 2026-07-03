(() => {
  const links = [...document.querySelectorAll('a[href*="/issues/"]')]
    .filter(a => /\d+$/.test(a.pathname) && a.textContent.trim());
  const seen = new Set();
  const out = [];
  links.forEach(link => {
    const match = link.pathname.match(/^(\/[^/]+\/[^/]+)\/issues\/(\d+)$/);
    if (!match) return;
    const url = link.href;
    if (seen.has(url)) return;
    seen.add(url);
    if (out.length >= {{args.limit}}) return;
    let row = link;
    for (let i = 0; i < 8 && row?.parentElement; i++) {
      row = row.parentElement;
      const siblings = [...row.parentElement?.children || []];
      if (siblings.filter(s => s.querySelector('a[href*="/issues/"]')).length > 1) break;
    }
    const text = row.textContent.replace(/\s+/g, ' ').trim();
    const repo = match[1].slice(1);
    const comments = (text.match(/(\d[\d,]*)\s*comments?/) || [])[1] || '';
    const status = /Status:\s*Closed/i.test(text) ? 'closed' : (/Status:\s*Open/i.test(text) ? 'open' : '');
    const author = (text.match(/by\s+(@?[\w-]+)/) || [])[1] || '';
    out.push({
      title: link.textContent.trim(),
      url,
      repo,
      number: match[2],
      status,
      author,
      comments,
    });
  });
  return out;
})()
