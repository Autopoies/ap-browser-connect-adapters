(() => {
  const rows = document.querySelectorAll('a.search_result_row');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const title = row.querySelector('.title')?.textContent?.trim() || '';
    if (!title) return;
    const priceBox = row.querySelector('.search_price_discount_combined');
    const final = priceBox?.querySelector('.discount_final_price')?.textContent?.trim() || '';
    const discount = row.querySelector('.discount_pct')?.textContent?.trim() || '';
    out.push({
      appid: row.getAttribute('data-ds-appid') || '',
      title,
      url: row.href || '',
      released: row.querySelector('.search_released')?.textContent?.trim() || '',
      price_text: final,
      price_cents: priceBox?.getAttribute('data-price-final') || '',
      discount_pct: discount,
    });
  });
  return out;
})()
