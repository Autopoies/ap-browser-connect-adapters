(() => {
  const stories = document.querySelectorAll('.story');
  const out = [];
  stories.forEach((s, i) => {
    if (i >= {{args.limit}}) return;
    const link = s.querySelector('.u-url');
    const title = link?.textContent?.trim() || '';
    if (!title) return;
    const commentsLink = [...s.querySelectorAll('a')].find(a => /\/s\/.+/.test(a.pathname));
    const commentsText = commentsLink?.textContent?.trim() || '';
    const commentsCount = (commentsText.match(/\d+/) || [])[0] || '';
    out.push({
      title,
      url: link?.href || '',
      score: s.querySelector('.upvoter')?.textContent?.trim() || '',
      comments_count: commentsCount,
      comments_url: commentsLink?.href || '',
      tags: [...s.querySelectorAll('.tag')].map(t => t.textContent.trim()),
      author: s.querySelector('.byline a[href^="/~"]')?.textContent?.trim() || '',
    });
  });
  return out;
})()
