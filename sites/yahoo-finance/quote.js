(() => {
  const text = document.body?.innerText || '';
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  const after = (label) => {
    const i = lines.findIndex(s => s.toLowerCase() === label.toLowerCase());
    return i >= 0 ? (lines[i + 1] || '') : '';
  };
  const valueAfterLabel = (label) => ([...document.querySelectorAll('span, td')]
    .map(e => e.textContent?.trim().toLowerCase() === label.toLowerCase()
      ? (e.nextElementSibling?.textContent?.trim() || '')
      : '')
    .find(Boolean) || '');
  const price = document.querySelector('[data-testid="qsp-price"]')?.textContent?.trim()
    || document.querySelector('[data-field="regularMarketPrice"]')?.textContent?.trim()
    || '';
  const changeText = document.querySelector('[data-testid="qsp-price-change"]')?.textContent?.trim() || '';
  const percentText = document.querySelector('[data-testid="qsp-price-change-percent"]')?.textContent?.trim() || '';
  const m = (changeText + ' ' + percentText).match(/([+-]?[\d,.]+)\s*\(?([+-]?[\d,.]+%)\)?/);
  const symbol = '{{args.symbol}}'.toUpperCase();
  return [{
    symbol,
    price,
    change: m?.[1] || changeText,
    change_percent: m?.[2] || percentText.replace(/[()]/g, ''),
    market_cap: valueAfterLabel('Market Cap') || after('Market Cap') || after('Market Cap (intraday)'),
    pe_ratio: valueAfterLabel('PE Ratio (TTM)') || after('PE Ratio (TTM)') || after('Trailing P/E'),
    volume: valueAfterLabel('Volume') || after('Volume'),
    previous_close: valueAfterLabel('Previous Close') || after('Previous Close'),
  }].filter(r => r.price || r.previous_close || r.market_cap);
})()
