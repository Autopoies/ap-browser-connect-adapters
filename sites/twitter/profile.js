(() => {
  const limit = {{args.limit}};
  const metric = (tweet, id) => {
    const el = tweet.querySelector(`[data-testid="${id}"]`);
    const text = el?.querySelector('span[data-testid="app-text-transition-container"]')?.textContent?.trim();
    return text || el?.getAttribute('aria-label') || '';
  };
  const tweet = t => {
    const text = t.querySelector('[data-testid="tweetText"]')?.textContent?.trim()
      || [...t.querySelectorAll('[lang]')].map(n => n.textContent.trim()).filter(Boolean).join('\n');
    if (!text) return null;
    const time = t.querySelector('time');
    const rawUrl = time?.closest('a[href*="/status/"]')?.href || t.querySelector('a[href*="/status/"]')?.href || '';
    const url = rawUrl.match(/https:\/\/x\.com\/[^/]+\/status\/\d+/)?.[0] || rawUrl;
    const user = t.querySelector('[data-testid="User-Name"]');
    const lines = (user?.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
    const profile = [...t.querySelectorAll('a[href]')].find(a => /^\/[^/?#]+$/.test(a.getAttribute('href') || '') && !a.getAttribute('href').startsWith('/i/'));
    return { author: lines.find(s => !s.startsWith('@') && s !== '·') || profile?.querySelector('span')?.textContent?.trim() || '', handle: lines.find(s => s.startsWith('@'))?.slice(1) || profile?.getAttribute('href')?.slice(1) || '', text: text.slice(0, 500), url, time: time?.getAttribute('datetime') || '', replies: metric(t, 'reply'), retweets: metric(t, 'retweet'), likes: metric(t, 'like') };
  };
  const bodyText = document.querySelector('[data-testid="primaryColumn"]')?.innerText || document.body.innerText;
  const first = re => bodyText.match(re)?.[1]?.trim() || '';
  const profile = {
    name: document.querySelector('[data-testid="UserName"]')?.textContent?.split('@')[0]?.trim() || '',
    bio: document.querySelector('[data-testid="UserDescription"]')?.textContent?.trim() || '',
    following: first(/([\d,.KMB\u4e07\u4ebf]+)\s*(?:Following|\u6b63\u5728\u5173\u6ce8)/i),
    followers: first(/([\d,.KMB\u4e07\u4ebf]+)\s*(?:Followers|\u5173\u6ce8\u8005)/i),
    tweet_count: first(/([\d,.KMB\u4e07\u4ebf]+)\s*(?:posts?|\u5e16\u5b50)/i)
  };
  return { profile, tweets: [...document.querySelectorAll('article[data-testid="tweet"]')].map(tweet).filter(Boolean).slice(0, limit) };
})()
