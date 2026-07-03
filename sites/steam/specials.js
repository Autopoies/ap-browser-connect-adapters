(() => {
  const rows = document.querySelectorAll('a.search_result_row');
  const out = [];
  rows.forEach((row, i) => {
    if (i >= {{args.limit}}) return;
    const title = row.querySelector('.title')?.textContent?.trim() || '';
    if (!title) return;
    out.push({
      appid: row.getAttribute('data-ds-appid') || '',
      title,
      url: row.href || '',
      released: row.querySelector('.search_released')?.textContent?.trim() || '',
      discount_pct: row.querySelector('.discount_pct')?.textContent?.trim() || '',
      original_price: row.querySelector('.discount_original_price')?.textContent?.trim() || '',
      final_price: row.querySelector('.discount_final_price')?.textContent?.trim() || '',
      price_cents: row.querySelector('.search_price_discount_combined')?.getAttribute('data-price-final') || '',
    });
  });
  return out;
})()
