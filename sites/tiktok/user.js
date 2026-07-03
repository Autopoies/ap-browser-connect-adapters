(() => {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const out = [];
  const seen = new Set();
  for (const link of document.querySelectorAll('a[href*="/video/"]')) {
    if (out.length >= {{args.limit}}) break;
    if (!link.href || seen.has(link.href)) continue;
    seen.add(link.href);
    const card = link.closest('div[class*="DivVideo"]') || link.parentElement?.parentElement || link;
    out.push({
      description: (clean(card.querySelector('[data-e2e*="desc"]')?.textContent) || clean(link.textContent)).slice(0, 200),
      url: link.href,
      likes: clean(card.querySelector('[data-e2e*="like"], [data-e2e*="digg"]')?.textContent),
      comments: clean(card.querySelector('[data-e2e*="comment"]')?.textContent),
    });
  }
  return out;
})()
