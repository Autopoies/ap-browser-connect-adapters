(() => {
  const comments = document.querySelectorAll('.comment');
  const out = [];
  comments.forEach((c, i) => {
    if (i >= {{args.limit}}) return;
    const byline = c.querySelector('.byline');
    const userLink = byline?.querySelector('a[href^="/~"]');
    const storyLink = c.querySelector('a[href*="/s/"]');
    out.push({
      user: userLink?.pathname?.replace('/', '') || userLink?.textContent?.trim() || '',
      age: c.querySelector('time')?.textContent?.trim() || '',
      on_story: storyLink?.textContent?.trim() || '',
      story_url: storyLink?.href || '',
      text: c.querySelector('.comment_text')?.textContent?.trim()?.slice(0, 500) || '',
    });
  });
  return out;
})()
