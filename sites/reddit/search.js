(() => {
  const data = JSON.parse(document.body.innerText);
  const children = data?.data?.children || [];
  return children.slice(0, {{args.limit}}).map(c => {
    const p = c.data || {};
    return {
      title: p.title || '',
      url: p.url || '',
      permalink: p.permalink ? 'https://www.reddit.com' + p.permalink : '',
      score: String(p.score ?? ''),
      num_comments: String(p.num_comments ?? ''),
      author: p.author || '',
      subreddit: p.subreddit || '',
    };
  });
})()
