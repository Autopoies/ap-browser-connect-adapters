(() => {
  const text = document.body?.innerText || '';
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  const after = (label) => {
    const i = lines.findIndex(s => s.toLowerCase() === label.toLowerCase());
    return i >= 0 ? (lines[i + 1] || '') : '';
  };
  const price = document.querySelector('.last-change')?.textContent?.trim() || '';
  const changeText = document.querySelector('.last-change.up, .last-change.down')?.textContent?.trim() || '';
  const m = changeText.match(/([+-]?[\d,.]+)\s*\(?([+-]?[\d,.]+%)\)?/);
  return [{
    symbol: '{{args.symbol}}'.toUpperCase(),
    price,
    change: m?.[1] || changeText,
    change_percent: m?.[2] || '',
    previous_close: after('Previous Close'),
    volume: after('Volume'),
    market_cap: after('Market Capitalization, $K'),
  }].filter(r => r.price || r.previous_close || r.volume);
})()
