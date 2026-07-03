(() => {
  const data = JSON.parse(document.body.innerText);
  if (!Array.isArray(data)) return [];
  return data.slice(0, {{args.limit}}).map(u => ({
    username: u.login || '',
    url: u.html_url || '',
  }));
})()
