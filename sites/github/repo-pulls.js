(() => {
  const data = JSON.parse(document.body.innerText);
  if (!Array.isArray(data)) return [];
  return data.map(p => ({
    number: p.number,
    title: p.title || '',
    url: p.html_url || '',
    state: p.state || '',
    author: p.user?.login || '',
    head: p.head?.ref || '',
    base: p.base?.ref || '',
    created_at: p.created_at || '',
  }));
})()
