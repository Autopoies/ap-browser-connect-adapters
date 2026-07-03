(() => {
  const apps = [...document.querySelectorAll('a[href*="/app/"]')].filter(a => a.textContent.trim());
  const seen = new Set();
  const out = [];
  apps.forEach(a => {
    const appid = a.href.match(/\/app\/(\d+)/)?.[1] || '';
    if (!appid || seen.has(appid)) return;
    seen.add(appid);
    if (out.length >= {{args.limit}}) return;
    let card = a;
    while (card?.parentElement) {
      card = card.parentElement;
      const siblings = [...card.parentElement?.children || []];
      if (siblings.some(s => s !== card && s.querySelector('a[href*="/app/"]'))) break;
    }
    const text = card.textContent.replace(/\s+/g, ' ').trim();
    const discount = (text.match(/-(\d+)%/) || [])[0] || '';
    const prices = [...text.matchAll(/¥([\d.]+)/g)].map(m => m[1]);
    out.push({
      appid,
      title: a.textContent.trim(),
      url: a.href,
      discount_pct: discount,
      original_price: prices[0] ? '¥' + prices[0] : '',
      final_price: prices[1] ? '¥' + prices[1] : (prices[0] ? '¥' + prices[0] : ''),
    });
  });
  return out;
})()
