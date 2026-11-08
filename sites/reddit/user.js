(() => {
  const out = [], seen = new Set(), limit = Math.max(0, {{args.limit}});
  const text = element => (element?.innerText || element?.textContent || '').trim();
  const iso = value => {
    const date = new Date(value || '');
    return Number.isFinite(date.getTime()) ? date.toISOString() : '';
  };
  // Combined selection preserves overview order when posts and comments coexist.
  for (const item of document.querySelectorAll('shreddit-post[post-title][permalink], shreddit-profile-comment[href]')) {
    if (out.length >= limit) break;
    if (item.hasAttribute('is-promoted') || item.closest('shreddit-ad-post')) continue;
    const isComment = item.tagName.toLowerCase() === 'shreddit-profile-comment';
    let url;
    try { url = new URL(item.getAttribute(isComment ? 'href' : 'permalink'), 'https://www.reddit.com'); } catch { continue; }
    const match = url.pathname.match(/^\/r\/([^/]+)\/comments\/[^/]+/);
    if (!match || !/^(?:www\.|old\.|new\.)?reddit\.com$/.test(url.hostname)) continue;
    const permalink = 'https://www.reddit.com' + url.pathname.replace(/\/?$/, '/');
    if (seen.has(permalink)) continue;
    const title = isComment
      ? text(item.querySelector('a[data-testid="post-title"], a[slot="title"], h2, h3'))
      : item.getAttribute('post-title')?.trim() || '';
    const body = text(item.querySelector(isComment ? '.md' : '[slot="text-body"]'));
    if (isComment ? !body : !title) continue;
    seen.add(permalink);
    out.push({
      kind: isComment ? 'comment' : 'link',
      title,
      body: body.slice(0, 500),
      permalink,
      score: item.getAttribute('score') || item.querySelector('shreddit-comment-action-row')?.getAttribute('score') || '',
      subreddit: match[1],
      created_utc: iso(item.getAttribute('created-timestamp') || item.querySelector('time[datetime]')?.getAttribute('datetime')),
    });
  }
  // Empty/hidden profiles are empty, not arbitrary comment-navigation/Reply links.
  return out;
})()
