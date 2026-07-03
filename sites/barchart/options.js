(async () => {
  const symbol = '{{args.symbol}}'.toUpperCase();
  const limit = {{args.limit}};
  const api = `/proxies/core-api/v1/options/get?baseSymbol=${encodeURIComponent(symbol)}&fields=symbol%2CbaseSymbol%2CstrikePrice%2CexpirationDate%2CbidPrice%2CaskPrice%2ClastPrice%2Cvolume%2CopenInterest%2CoptionType&groupBy=optionType&expirationDate=nearest&orderBy=strikePrice&orderDir=asc&raw=1`;
  if (api) {
    const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
    const json = await fetch(api, { headers: { 'x-xsrf-token': xsrf, accept: 'application/json' } }).then(r => r.json()).catch(() => null);
    const data = Array.isArray(json?.data) ? json.data : Object.values(json?.data || {}).flat();
    return data.slice(0, limit).map(o => ({
      symbol,
      expiration: o.expirationDate || '',
      type: o.optionType || '',
      strike: String(o.strikePrice ?? ''),
      last: String(o.lastPrice ?? ''),
      bid: String(o.bidPrice ?? ''),
      ask: String(o.askPrice ?? ''),
      volume: String(o.volume ?? ''),
      open_interest: String(o.openInterest ?? ''),
    }));
  }
  const rows = [...document.querySelectorAll('table tbody tr, .bc-table-scrollable tbody tr, [class*="option"] tbody tr')];
  const out = [];
  rows.forEach((row) => {
    if (out.length >= limit) return;
    const cells = [...row.children].map(c => c.textContent?.trim() || '').filter(Boolean);
    if (cells.length < 5) return;
    out.push({
      symbol,
      expiration: cells[0] || '',
      type: cells.find(c => /^(call|put)$/i.test(c)) || '',
      strike: cells.find(c => /^\d+(\.\d+)?$/.test(c)) || '',
      last: cells[2] || '',
      bid: cells[3] || '',
      ask: cells[4] || '',
      volume: cells.find(c => /^[\d,]+$/.test(c)) || '',
      open_interest: cells[cells.length - 1] || '',
    });
  });
  return out;
})()
