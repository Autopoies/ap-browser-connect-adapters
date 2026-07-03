(() => {
  const raw = document.body.innerText;
  const data = JSON.parse(raw);
  const children = data?.data?.children || [];
  const out = [];
  children.forEach((c, i) => {
    if (i >= {{args.limit}}) return;
    const p = c.data;
    if (!p?.title) return;
    out.push({
      title: p.title,
      url: p.url || '',
      permalink: p.permalink ? 'https://www.reddit.com' + p.permalink : '',
      score: String(p.score ?? ''),
      num_comments: String(p.num_comments ?? ''),
      author: p.author || '',
      subreddit: p.subreddit || '',
    });
  });
  return out;
})()
