(() => {
  const data = JSON.parse(document.body.innerText);
  if (!Array.isArray(data)) return [];
  return data
    .map(i => ({
      number: i.number,
      title: i.title || '',
      url: i.html_url || '',
      state: i.state || '',
      author: i.user?.login || '',
      comments: String(i.comments ?? ''),
      created_at: i.created_at || '',
    }));
})()
