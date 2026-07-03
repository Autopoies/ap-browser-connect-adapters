(() => {
  const seen = new Set();
  const out = [];
  const limit = {{args.limit}};
  [...document.querySelectorAll('a[href*="?i="]')].forEach((a) => {
    if (out.length >= limit) return;
    const url = a.href || '';
    if (seen.has(url)) return;
    const rawLines = (a.textContent || '').split('\n').map(s => s.trim()).filter(Boolean);
    const text = rawLines.join(' ');
    const compact = text.replace(/^(\d+d ago|\d+h ago|\w+ \d+)(\s*•\s*Subscribers Only)?\s+/, '');
    const titleLine = rawLines.find(s => !/^(\d+d ago|\d+h ago|\w+ \d+|Subscribers Only|Free Episode|Trailer)$/i.test(s))
      || compact.split(/\s{2,}/)[0]
      || compact;
    const title = a.getAttribute('aria-label')?.trim() || titleLine;
    if (!title) return;
    seen.add(url);
    out.push({
      title,
      date: (text.match(/^(\d+d ago|\d+h ago|\w+ \d+)/) || [])[1] || '',
      duration: (text.match(/(\d+\s*h\s*\d*\s*m|\d+\s*min)$/) || [])[1] || '',
      url,
    });
  });
  return out;
})()
