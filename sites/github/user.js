(() => {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const followersLink = document.querySelector('a[href*="tab=followers"]');
  const followingLink = document.querySelector('a[href*="tab=following"]');
  const reposLink = document.querySelector('a[href$="tab=repositories"]');
  const extractNum = (s) => (clean(s).match(/([\d.]+k?)/i) || [])[1] || '';
  return {
    username: '{{args.username}}',
    name: clean(document.querySelector('span.p-name')?.textContent),
    bio: clean(document.querySelector('.p-note')?.textContent),
    followers: extractNum(followersLink?.textContent),
    following: extractNum(followingLink?.textContent),
    repos: extractNum(reposLink?.textContent),
    location: clean(document.querySelector('li[itemprop="homeLocation"]')?.textContent),
    company: clean(document.querySelector('li[itemprop="worksFor"]')?.textContent),
  };
})()
