(() => {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const main = document.querySelector('[role="main"]') || document.body;
  const name = clean(main.querySelector('h1')?.textContent || document.title.replace(/\| Facebook.*/, ''));
  const bio = clean([...main.querySelectorAll('[aria-label], h2, h3')].map(x => x.getAttribute('aria-label') || x.textContent).find(Boolean));
  const posts = [];
  const seen = new Set();
  main.querySelectorAll('[role="article"]').forEach(article => {
    if (posts.length >= {{args.limit}}) return;
    const link = article.querySelector('a[href*="/posts/"], a[href*="/photos/"], a[href*="/videos/"]');
    const time = clean(article.querySelector('time, [abbr]')?.textContent || article.querySelector('[abbr]')?.getAttribute('abbr'));
    const text = clean(article.innerText).slice(0, 2000);
    const key = `${time}|${text.slice(0, 120)}`;
    if (!text || seen.has(key)) return;
    seen.add(key);
    posts.push({ text, url: link?.href || '', time });
  });
  return { name, bio, posts };
})()
