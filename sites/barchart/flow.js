(async () => {
  const out = [];
  const limit = {{args.limit}};
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const api = performance.getEntriesByType('resource').map(e => e.name)
    .find(u => u.includes('/proxies/core-api/v1/options/get') && u.includes('volumeOpenInterestRatio'))
    || `/proxies/core-api/v1/options/get?fields=symbol%2CbaseSymbol%2CexpirationDate%2CstrikePrice%2ClastPrice%2Cvolume%2CopenInterest%2CoptionType&orderBy=volumeOpenInterestRatio&orderDir=desc&baseSymbolTypes=stock&between(volumeOpenInterestRatio%2C1.24%2C)=&between(lastPrice%2C.10%2C)=&between(tradeTime%2C${yesterday}%2C${today})=&between(volume%2C500%2C)=&between(openInterest%2C100%2C)=&limit=50&hasOptions=true&raw=1`;
  if (api) {
    const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
    const json = await fetch(api, { headers: { 'x-xsrf-token': xsrf, accept: 'application/json' } }).then(r => r.json()).catch(() => null);
    const data = Array.isArray(json?.data) ? json.data : Object.values(json?.data || {}).flat();
    return data.slice(0, limit).map(o => ({
      symbol: o.baseSymbol || o.symbol || '',
      expiration: o.expirationDate || '',
      type: o.optionType || '',
      strike: String(o.strikePrice ?? ''),
      last: String(o.lastPrice ?? ''),
      volume: String(o.volume ?? ''),
      open_interest: String(o.openInterest ?? ''),
    }));
  }
  const rows = [...document.querySelectorAll('table tbody tr, .bc-table-scrollable tbody tr')];
  rows.forEach((row) => {
    if (out.length >= limit) return;
    const cells = [...row.children].map(c => c.textContent?.trim() || '').filter(Boolean);
    if (cells.length < 5) return;
    out.push({
      symbol: cells[0] || '',
      expiration: cells[1] || '',
      type: cells.find(c => /^(call|put)$/i.test(c)) || '',
      strike: cells.find(c => /^\d+(\.\d+)?$/.test(c)) || '',
      last: cells[2] || '',
      volume: cells.find(c => /^[\d,]+$/.test(c)) || '',
      open_interest: cells[cells.length - 1] || '',
    });
  });
  return out;
})()
