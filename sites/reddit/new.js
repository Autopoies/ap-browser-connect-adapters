(() => {
  const out = [];
  const seen = new Set();
  const limit = {{args.limit}};
  const abs = (h) => h ? (h.startsWith('http') ? h : 'https://www.reddit.com' + h) : '';
  document.querySelectorAll('shreddit-post').forEach((el) => {
    if (out.length >= limit) return;
    const permalink = el.getAttribute('permalink') || '';
    if (!permalink || seen.has(permalink)) return;
    seen.add(permalink);
    out.push({
      title: el.getAttribute('post-title') || '',
      url: el.getAttribute('content-href') || abs(permalink),
      permalink: abs(permalink),
      score: el.getAttribute('score') || '',
      num_comments: el.getAttribute('comment-count') || '',
      author: el.getAttribute('author') || '',
      subreddit: (el.getAttribute('subreddit-prefixed-name') || '').replace(/^r\//, ''),
    });
  });
  if (out.length === 0) {
    document.querySelectorAll('a[href*="/comments/"]').forEach((a) => {
      if (out.length >= limit) return;
      const href = a.getAttribute('href') || '';
      const m = href.match(/\/r\/([^/]+)\/comments\//);
      const pl = href.split('?')[0];
      if (!m || seen.has(pl)) return;
      seen.add(pl);
      const t = (a.textContent || '').trim();
      if (!t) return;
      out.push({ title: t, url: abs(pl), permalink: abs(pl), score: '', num_comments: '', author: '', subreddit: m[1] });
    });
  }
  return out;
})()
