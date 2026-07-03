(() => {
  const data = JSON.parse(document.body.innerText);
  if (!Array.isArray(data)) return [];
  return data.slice(0, {{args.limit}}).map(c => ({
    username: c.login || '',
    url: c.html_url || '',
    contributions: String(c.contributions ?? ''),
  }));
})()
