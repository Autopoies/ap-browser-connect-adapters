(() => {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const out = [];
  const seen = new Set();
  const typeOf = href => href.includes('/posts/') ? 'post' : href.includes('/photos/') ? 'photo' : href.includes('/videos/') ? 'video' : href.includes('/user/') || href.includes('/profile.php') ? 'person' : 'result';
  const links = document.querySelectorAll('a[href*="/posts/"], a[href*="/photos/"], a[href*="/videos/"], a[href*="/user/"], a[href*="/profile.php"]');
  links.forEach(link => {
    if (out.length >= {{args.limit}}) return;
    const box = link.closest('[role="article"], [role="listitem"], [role="main"]') || link;
    const title = clean(link.textContent) || clean(box.querySelector('h2, h3, strong')?.textContent);
    const text = clean(box.innerText).slice(0, 1000);
    const time = clean(box.querySelector('time, [abbr]')?.textContent || box.querySelector('[abbr]')?.getAttribute('abbr'));
    const key = link.href.split('?')[0];
    if (!title && !text || seen.has(key)) return;
    seen.add(key);
    out.push({ type: typeOf(link.href), title, text, url: link.href, time });
  });
  return out;
})()
