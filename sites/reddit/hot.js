(() => {
  const out = [], seen = new Set(), limit = Math.max(0, {{args.limit}});
  const absolute = value => {
    try { const url = new URL(value, 'https://www.reddit.com'); return /^https?:$/.test(url.protocol) ? url.href : ''; }
    catch { return ''; }
  };
  for (const post of document.querySelectorAll('shreddit-post[post-title][permalink]')) {
    if (out.length >= limit) break;
    if (post.hasAttribute('is-promoted') || post.hasAttribute('promoted') || post.closest('shreddit-ad-post')) continue;
    const title = post.getAttribute('post-title')?.trim() || '';
    let url;
    try { url = new URL(post.getAttribute('permalink'), 'https://www.reddit.com'); } catch { continue; }
    if (!title || !/^(?:www\.|old\.|new\.)?reddit\.com$/.test(url.hostname) || !/^\/r\/[^/]+\/comments\/[^/]+/.test(url.pathname)) continue;
    const permalink = 'https://www.reddit.com' + url.pathname.replace(/\/?$/, '/');
    if (seen.has(permalink)) continue;
    seen.add(permalink);
    out.push({
      title,
      url: absolute(post.getAttribute('content-href') || permalink),
      permalink,
      score: post.getAttribute('score') || '',
      num_comments: post.getAttribute('comment-count') || '',
      author: post.getAttribute('author') || '',
      subreddit: post.getAttribute('subreddit-name') || (post.getAttribute('subreddit-prefixed-name') || '').replace(/^r\//, ''),
    });
  }
  return out;
})()
