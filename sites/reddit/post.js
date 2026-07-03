(() => {
  const data = JSON.parse(document.body.innerText);
  if (!Array.isArray(data)) return { error: 'unexpected response' };
  const post = data[0]?.data?.children?.[0]?.data || {};
  const comments = (data[1]?.data?.children || [])
    .filter(c => c.kind === 't1' && c.data?.body)
    .slice(0, {{args.limit}})
    .map(c => ({
      author: c.data.author || '',
      body: (c.data.body || '').slice(0, 1000),
      score: String(c.data.score ?? ''),
      created_utc: c.data.created_utc ? new Date(c.data.created_utc * 1000).toISOString() : '',
    }));
  return {
    title: post.title || '',
    url: post.url || '',
    score: String(post.score ?? ''),
    num_comments: String(post.num_comments ?? ''),
    author: post.author || '',
    subreddit: post.subreddit || '',
    body: (post.selftext || '').slice(0, 2000),
    comments,
  };
})()
