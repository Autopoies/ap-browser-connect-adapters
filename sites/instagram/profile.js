(() => {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const main = document.querySelector('main') || document.body;
  const header = main.querySelector('header section, header, [data-testid]') || main;
  const headerText = clean(header.innerText);
  const name = clean(header.querySelector('h1, h2')?.textContent) || clean(document.title.split('•')[0]);
  const followers = clean([...header.querySelectorAll('a, span')].map(x => x.textContent).find(t => /followers/i.test(t || '')) || '');
  const bio = headerText.split('\n').filter(Boolean).slice(1, 6).join(' | ');
  const posts = [];
  const seen = new Set();
  main.querySelectorAll('article a[href*="/p/"], article a[href*="/reel/"], main a[href*="/p/"], main a[href*="/reel/"]').forEach(link => {
    if (posts.length >= {{args.limit}}) return;
    const key = link.href.split('?')[0];
    if (seen.has(key)) return;
    seen.add(key);
    const img = link.querySelector('img');
    posts.push({ type: key.includes('/reel/') ? 'reel' : 'post', url: link.href, thumbnail: img?.src || '', text: clean(img?.alt || link.textContent) });
  });
  return { name, bio, followers, posts };
})()
