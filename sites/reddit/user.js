(() => {
  const data = JSON.parse(document.body.innerText);
  const children = data?.data?.children || [];
  return children.slice(0, {{args.limit}}).map(c => {
    const d = c.data || {};
    const isComment = c.kind === 't1';
    return {
      kind: isComment ? 'comment' : 'link',
      title: d.title || d.link_title || '',
      body: (isComment ? d.body : d.selftext || '').slice(0, 500),
      permalink: d.permalink ? 'https://www.reddit.com' + d.permalink : '',
      score: String(d.score ?? ''),
      subreddit: d.subreddit || '',
      created_utc: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : '',
    };
  });
})()
