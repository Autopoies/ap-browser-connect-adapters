(() => {
  const data = JSON.parse(document.body.innerText);
  if (!Array.isArray(data)) return [];
  return data.slice(0, {{args.limit}}).map(r => ({
    name: r.full_name || '',
    url: r.html_url || '',
    description: r.description || '',
    stars: String(r.stargazers_count ?? ''),
    language: r.language || '',
    updated: r.updated_at || '',
  }));
})()
