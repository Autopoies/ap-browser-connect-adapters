(() => {
  const data = JSON.parse(document.body.innerText);
  const hits = data?.hits || [];
  return hits.slice(0, {{args.limit}}).map(h => ({
    id: h.objectID || '',
    title: h.title || h.story_title || '',
    url: h.url || '',
    points: String(h.points ?? ''),
    author: h.author || '',
    num_comments: String(h.num_comments ?? ''),
    created_at: h.created_at || '',
  }));
})()
