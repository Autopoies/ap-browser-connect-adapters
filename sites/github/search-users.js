(() => {
  const d = JSON.parse(document.body.innerText);
  const items = d?.items || [];
  return items.slice(0, {{args.limit}}).map(u => ({
    username: u.login || '',
    url: u.html_url || '',
    type: u.type || '',
  }));
})()
