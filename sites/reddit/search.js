(() => {
  const out = [], seen = new Set(), limit = Math.max(0, {{args.limit}});
  // Search renders title anchors rather than shreddit-post. Never treat Reply,
  // thumbnail or preview-body anchors as separate posts.
  for (const link of document.querySelectorAll('a[data-testid="post-title"], a[data-testid="post-title-text"], a[slot="title"]')) {
    if (out.length >= limit) break;
    let url;
    try { url = new URL(link.getAttribute('href'), 'https://www.reddit.com'); } catch { continue; }
    const match = url.pathname.match(/^\/r\/([^/]+)\/comments\/[^/]+\/[^/]+\/?$/);
    const title = link.textContent?.trim() || '';
    if (!title || !match || !/^(?:www\.|old\.|new\.)?reddit\.com$/.test(url.hostname)) continue;
    const permalink = 'https://www.reddit.com' + url.pathname.replace(/\/?$/, '/');
    if (seen.has(permalink)) continue;
    const card = link.closest('[data-testid="search-post-with-content-preview"], [data-testid="search-post"], shreddit-post');
    if (card?.hasAttribute('is-promoted') || card?.closest('shreddit-ad-post')) continue;
    seen.add(permalink);
    // In the observed counter row, positions are votes then comments. Read raw
    // number attributes, not localized/rounded labels; a lone counter is ambiguous.
    const counters = card?.querySelectorAll('[data-testid="search-counter-row"] faceplate-number[number]');
    out.push({
      title,
      // Search cards do not expose the outbound destination; use the post URL.
      url: permalink,
      permalink,
      score: card?.getAttribute('score') || (counters?.length >= 2 ? counters[0].getAttribute('number') : '') || '',
      num_comments: card?.getAttribute('comment-count') || (counters?.length >= 2 ? counters[1].getAttribute('number') : '') || '',
      author: card?.getAttribute('author') || '',
      subreddit: match[1],
    });
  }
  return out;
})()
