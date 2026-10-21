(() => {
  const text = element => (element?.innerText || element?.textContent || '').trim();
  const iso = value => {
    const date = new Date(value || '');
    return Number.isFinite(date.getTime()) ? date.toISOString() : '';
  };
  const requested = location.pathname.match(/\/comments\/([^/]+)/)?.[1];
  const posts = [...document.querySelectorAll('shreddit-post[post-title]')];
  const post = requested
    ? posts.find(item => item.getAttribute('permalink')?.match(/\/comments\/([^/]+)/)?.[1] === requested)
    : posts[0];
  if (!post) throw new Error('Requested Reddit post is not available in the rendered page');
  const comments = [], limit = Math.max(0, {{args.limit}});
  for (const comment of document.querySelectorAll('shreddit-comment')) {
    if (comments.length >= limit) break;
    if (comment.parentElement?.closest('shreddit-comment')) continue;
    if (comment.hasAttribute('depth') && comment.getAttribute('depth') !== '0') continue;
    // A deleted/collapsed parent must never inherit a nested reply's body.
    const bodyNode = [...comment.querySelectorAll('[slot="comment"] .md, .md, div[id$="-post-rtjson-content"], [data-testid="comment"]')]
      .find(node => node.closest('shreddit-comment') === comment);
    const body = text(bodyNode);
    if (!body) continue;
    comments.push({
      author: comment.getAttribute('author') || '',
      body: body.slice(0, 1000),
      score: comment.getAttribute('score') || comment.querySelector('shreddit-comment-action-row')?.getAttribute('score') || '',
      created_utc: iso(comment.getAttribute('created') || comment.querySelector('time[datetime]')?.getAttribute('datetime')),
    });
  }
  let url = '';
  try { url = new URL(post.getAttribute('content-href') || post.getAttribute('permalink'), 'https://www.reddit.com').href; } catch {}
  return {
    title: post.getAttribute('post-title') || '',
    url,
    score: post.getAttribute('score') || '',
    num_comments: post.getAttribute('comment-count') || '',
    author: post.getAttribute('author') || '',
    subreddit: post.getAttribute('subreddit-name') || (post.getAttribute('subreddit-prefixed-name') || '').replace(/^r\//, ''),
    body: text(post.querySelector('[slot="text-body"]')).slice(0, 2000),
    comments,
  };
})()
