(() => {
  const d = JSON.parse(document.body.innerText);
  const items = d?.items || [];
  return items.slice(0, {{args.limit}}).map(r => ({
    name: r.full_name || '',
    url: r.html_url || '',
    description: r.description || '',
    stars: String(r.stargazers_count ?? ''),
    language: r.language || '',
  }));
})()
