(() => {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const near = (el) => el.closest('div[class*="DivVideo"]') || el.parentElement?.parentElement?.parentElement || el;
  const textFrom = (card, selectors) => {
    for (const selector of selectors) {
      const text = clean(card.querySelector(selector)?.textContent);
      if (text) return text;
    }
    return '';
  };
  const out = [];
  const seen = new Set();
  for (const link of document.querySelectorAll('a[href*="/video/"]')) {
    if (out.length >= {{args.limit}}) break;
    const url = link.href;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const card = near(link);
    const creator = clean((url.match(/@([^/]+)/) || [])[1]) || textFrom(card, ['[data-e2e*="author"]', 'a[href*="/@"]']);
    const description = textFrom(card, ['[data-e2e*="desc"]', '[data-e2e*="caption"]']) || clean(link.textContent);
    const likes = textFrom(card, ['[data-e2e*="like"]', '[data-e2e*="digg"]']);
    const comments = textFrom(card, ['[data-e2e*="comment"]']);
    out.push({ creator, description: description.slice(0, 200), url, likes, comments });
  }
  return out;
})()
