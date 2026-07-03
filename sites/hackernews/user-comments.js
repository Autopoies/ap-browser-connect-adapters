(() => {
  const data = JSON.parse(document.body.innerText);
  const hits = data?.hits || [];
  return hits.slice(0, {{args.limit}}).map(h => ({
    id: h.objectID || '',
    text: (h.comment_text || '').replace(/<[^>]+>/g, '').slice(0, 800),
    points: String(h.points ?? ''),
    story_title: h.story_title || '',
    story_url: h.story_url || (h.story_id ? `https://news.ycombinator.com/item?id=${h.story_id}` : ''),
    created_at: h.created_at || '',
  }));
})()
