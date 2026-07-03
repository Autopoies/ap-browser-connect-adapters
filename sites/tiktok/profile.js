(() => {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const pick = (...selectors) => selectors.map((s) => clean(document.querySelector(s)?.textContent)).find(Boolean) || '';
  const videos = [];
  const seen = new Set();
  for (const link of document.querySelectorAll('a[href*="/video/"]')) {
    if (videos.length >= {{args.limit}}) break;
    if (!link.href || seen.has(link.href)) continue;
    seen.add(link.href);
    const card = link.closest('div[class*="DivVideo"]') || link.parentElement?.parentElement || link;
    videos.push({
      description: (clean(card.querySelector('[data-e2e*="desc"]')?.textContent) || clean(link.textContent)).slice(0, 200),
      url: link.href,
      likes: clean(card.querySelector('[data-e2e*="like"], [data-e2e*="digg"]')?.textContent),
      comments: clean(card.querySelector('[data-e2e*="comment"]')?.textContent),
    });
  }
  const lines = clean(document.body.innerText).split(' ').filter(Boolean);
  const followerWord = lines.findIndex((x) => /粉丝|Followers?/i.test(x));
  const likeWord = lines.findIndex((x) => /赞|Likes?/i.test(x));
  return {
    name: pick('[data-e2e*="user-title"]', '[data-e2e*="user-subtitle"]', 'h1') || lines[1] || lines[0] || '',
    bio: pick('[data-e2e*="user-bio"]', '[data-e2e*="bio"]') || (likeWord >= 0 ? lines.slice(likeWord + 1, followerWord > likeWord ? followerWord : likeWord + 8).join(' ') : ''),
    followers: pick('[data-e2e*="followers"]', '[data-e2e*="follower"]') || (followerWord > 0 ? lines[followerWord - 1] : ''),
    videos,
  };
})()
