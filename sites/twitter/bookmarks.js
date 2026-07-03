(() => {
  const limit = {{args.limit}};
  const metric = (tweet, id) => {
    const el = tweet.querySelector(`[data-testid="${id}"]`);
    const text = el?.querySelector('span[data-testid="app-text-transition-container"]')?.textContent?.trim();
    return text || el?.getAttribute('aria-label') || '';
  };
  const one = tweet => {
    const raw = tweet.innerText || '';
    const text = tweet.querySelector('[data-testid="tweetText"]')?.textContent?.trim()
      || [...tweet.querySelectorAll('[lang]')].map(n => n.textContent.trim()).filter(Boolean).join('\n')
      || raw.split('\n').map(s => s.trim()).filter(Boolean).slice(4).join('\n');
    if (!text) return null;
    const time = tweet.querySelector('time');
    const rawUrl = time?.closest('a[href*="/status/"]')?.href || tweet.querySelector('a[href*="/status/"]')?.href || '';
    const url = rawUrl.match(/https:\/\/x\.com\/[^/]+\/status\/\d+/)?.[0] || rawUrl;
    const user = tweet.querySelector('[data-testid="User-Name"]');
    const lines = (user?.innerText || raw).split('\n').map(s => s.trim()).filter(Boolean);
    const profile = [...tweet.querySelectorAll('a[href]')].find(a => /^\/[^/?#]+$/.test(a.getAttribute('href') || '') && !a.getAttribute('href').startsWith('/i/'));
    return { author: lines.find(s => !s.startsWith('@') && s !== '·') || profile?.querySelector('span')?.textContent?.trim() || '', handle: lines.find(s => s.startsWith('@'))?.slice(1) || profile?.getAttribute('href')?.slice(1) || '', text: text.slice(0, 500), url, time: time?.getAttribute('datetime') || '', replies: metric(tweet, 'reply'), retweets: metric(tweet, 'retweet'), likes: metric(tweet, 'like') };
  };
  return [...document.querySelectorAll('article[data-testid="tweet"], article')].map(one).filter(Boolean).slice(0, limit);
})()
