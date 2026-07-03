(() => {
  return {
    repo: '{{args.repo}}',
    url: location.href,
    about: document.querySelector('p.f4')?.textContent?.trim()?.slice(0, 300) || '',
    stars: document.querySelector('#repo-stars-counter-star')?.textContent?.trim() || '',
    forks: document.querySelector('#repo-network-counter')?.textContent?.trim() || '',
    watchers: document.querySelector('#repo-notifications-counter')?.textContent?.trim() || '',
    primary_language: document.querySelector('span[itemprop="programmingLanguage"]')?.textContent?.trim() || '',
    topics: [...document.querySelectorAll('.topic-tag')].map(t => t.textContent.trim()).slice(0, 20),
  };
})()
