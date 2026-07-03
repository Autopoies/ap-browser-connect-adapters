(() => {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const near = (el) => el.closest('div[class*="DivVideo"]') || el.parentElement?.parentElement?.parentElement || el;
  const firstText = (card, selectors) => selectors.map((s) => clean(card.querySelector(s)?.textContent)).find(Boolean) || '';
  const out = [];
  const seen = new Set();
  for (const link of document.querySelectorAll('a[href*="/video/"]')) {
    if (out.length >= {{args.limit}}) break;
    const url = link.href;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const card = near(link);
    out.push({
      creator: clean((url.match(/@([^/]+)/) || [])[1]) || firstText(card, ['[data-e2e*="author"]', 'a[href*="/@"]']),
      description: (firstText(card, ['[data-e2e*="desc"]', '[data-e2e*="caption"]']) || clean(link.textContent)).slice(0, 200),
      url,
      likes: firstText(card, ['[data-e2e*="like"]', '[data-e2e*="digg"]']),
      comments: firstText(card, ['[data-e2e*="comment"]']),
    });
  }
  return out;
})()
