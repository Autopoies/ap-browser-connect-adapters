(() => {
  const links = [...document.querySelectorAll('a[href*="/pull/"]')]
    .filter(a => /\d+$/.test(a.pathname) && a.textContent.trim());
  const seen = new Set();
  const out = [];
  links.forEach(link => {
    const match = link.pathname.match(/^(\/[^/]+\/[^/]+)\/pull\/(\d+)$/);
    if (!match) return;
    const url = link.href;
    if (seen.has(url)) return;
    seen.add(url);
    if (out.length >= {{args.limit}}) return;
    let row = link;
    for (let i = 0; i < 8 && row?.parentElement; i++) {
      row = row.parentElement;
      const siblings = [...row.parentElement?.children || []];
      if (siblings.filter(s => s.querySelector('a[href*="/pull/"]')).length > 1) break;
    }
    const text = row.textContent.replace(/\s+/g, ' ').trim();
    const comments = (text.match(/(\d[\d,]*)\s*comments?/) || [])[1] || '';
    const status = /Status:\s*Merged/i.test(text) ? 'merged' : (/Status:\s*Closed/i.test(text) ? 'closed' : (/Status:\s*Open/i.test(text) ? 'open' : ''));
    out.push({
      title: link.textContent.trim(),
      url,
      repo: match[1].slice(1),
      number: match[2],
      status,
      comments,
    });
  });
  return out;
})()
