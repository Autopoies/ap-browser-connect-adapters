(() => {
  const out = []; const seen = new Set(); const limit = {{args.limit}};
  document.querySelectorAll('a[href*="/comments/"]').forEach((a) => {
    if (out.length >= limit) return;
    const href = (a.getAttribute('href') || '').split('?')[0];
    const m = href.match(/\/r\/([^/]+)\/comments\//);
    if (!m || seen.has(href)) return;
    const t = (a.textContent || '').trim();
    if (!t) return;
    seen.add(href);
    out.push({ title: t, url: 'https://www.reddit.com' + href, permalink: 'https://www.reddit.com' + href, score: '', num_comments: '', author: '', subreddit: m[1] });
  });
  return out;
})()
