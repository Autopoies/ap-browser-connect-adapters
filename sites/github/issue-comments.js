(() => {
  const data = JSON.parse(document.body.innerText);
  if (!Array.isArray(data)) return [];
  return data.slice(0, {{args.limit}}).map(c => ({
    author: c.user?.login || '',
    body: (c.body || '').slice(0, 2000),
    created_at: c.created_at || '',
  }));
})()
