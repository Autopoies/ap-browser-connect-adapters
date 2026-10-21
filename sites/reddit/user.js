(() => {
  const out = []; const seen = new Set(); const limit = {{args.limit}};
  document.querySelectorAll('shreddit-post').forEach((el) => {
    if (out.length >= limit) return;
    const pl = el.getAttribute('permalink') || '';
    if (!pl || seen.has(pl)) return;
    seen.add(pl);
    out.push({ kind: 'post', title: el.getAttribute('post-title') || '', body: '', permalink: 'https://www.reddit.com' + pl, score: el.getAttribute('score') || '', subreddit: (el.getAttribute('subreddit-prefixed-name') || '').replace(/^r\//, ''), created_utc: el.getAttribute('created-timestamp') || '' });
  });
  if (out.length === 0) {
    document.querySelectorAll('a[href*="/comments/"]').forEach((a) => {
      if (out.length >= limit) return;
      const href = (a.getAttribute('href') || '').split('?')[0];
      const m = href.match(/\/r\/([^/]+)\/comments\//);
      const t = (a.textContent || '').trim();
      if (!m || !t || seen.has(href)) return;
      seen.add(href);
      out.push({ kind: 'post', title: t, body: '', permalink: 'https://www.reddit.com' + href, score: '', subreddit: m[1], created_utc: '' });
    });
  }
  return out;
})()
