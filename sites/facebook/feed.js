(() => {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const posts = [];
  const seen = new Set();
  document.querySelectorAll('[role="article"]').forEach(article => {
    if (posts.length >= {{args.limit}}) return;
    const authorLink = article.querySelector('a[href*="/user/"], a[href*="/profile.php"]');
    const author = clean(authorLink?.textContent) || clean(article.querySelector('h2, h3, strong')?.textContent);
    const contentLink = article.querySelector('a[href*="/posts/"], a[href*="/photos/"], a[href*="/videos/"]');
    const time = clean(article.querySelector('time, [abbr]')?.textContent || article.querySelector('[abbr]')?.getAttribute('abbr'));
    const text = clean(article.innerText).slice(0, 3000);
    const key = `${author}|${time}|${text.slice(0, 120)}`;
    if (!text || seen.has(key)) return;
    seen.add(key);
    posts.push({ author, text, url: contentLink?.href || '', time });
  });
  return posts;
})()
