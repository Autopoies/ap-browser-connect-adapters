(() => {
  const d = JSON.parse(document.body.innerText);
  if (d.message) return { error: d.message };
  return {
    number: d.number,
    title: d.title || '',
    state: d.state || '',
    author: d.user?.login || '',
    body: (d.body || '').slice(0, 5000),
    comments: String(d.comments ?? ''),
    created_at: d.created_at || '',
  };
})()
