(() => {
  const comments = [...document.querySelectorAll('.comment')]
    .slice(0, {{args.limit}})
    .map(c => {
      const score = c.querySelector('.score')?.textContent?.trim() || '';
      const user = c.querySelector('.byline a[href^="/~"], .comment_head .user')?.textContent?.trim() || '';
      const text = c.querySelector('.comment_text, .text')?.textContent?.trim()?.slice(0, 800) || '';
      const age = c.querySelector('.byline time, time')?.textContent?.trim() || '';
      return { score, user, age, text };
    })
    .filter(c => c.text);
  return {
    title: document.querySelector('.link u-url, h1 .u-url, .u-url')?.textContent?.trim() || document.title,
    url: location.href,
    comments,
  };
})()
