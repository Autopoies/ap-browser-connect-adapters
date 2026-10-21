(() => {
  const p = document.querySelector('shreddit-post');
  const limit = {{args.limit}};
  const comments = [];
  document.querySelectorAll('shreddit-comment').forEach((c) => {
    if (comments.length >= limit) return;
    const parentComment = c.parentElement && c.parentElement.closest('shreddit-comment');
    if (parentComment) return;
    const md = c.querySelector('[slot="comment"] .md, .md') || c.querySelector('div[id$="-post-rtjson-content"], [data-testid="comment"]');
    const body = ((md && md.innerText) || '').trim();
    if (!body) return;
    comments.push({ author: c.getAttribute('author') || '', body: body.slice(0, 1000), score: c.getAttribute('score') || '', created_utc: c.getAttribute('created') || '' });
  });
  const pbody = document.querySelector('[slot="text-body"] .md, shreddit-post [slot="text-body"]');
  return {
    title: p ? (p.getAttribute('post-title') || '') : '',
    url: p ? (p.getAttribute('content-href') || '') : '',
    score: p ? (p.getAttribute('score') || '') : '',
    num_comments: p ? (p.getAttribute('comment-count') || '') : '',
    author: p ? (p.getAttribute('author') || '') : '',
    subreddit: p ? (p.getAttribute('subreddit-prefixed-name') || '').replace(/^r\//, '') : '',
    body: ((pbody && pbody.innerText) || '').slice(0, 2000),
    comments,
  };
})()
