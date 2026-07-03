(() => {
  return {
    bvid: location.href.match(/\/(BV[\w]+)\b/)?.[1] || '',
    url: location.href,
    title: document.querySelector('h1.video-title, [class*="video-title"]')?.textContent?.trim() || '',
    up: document.querySelector('.up-name, [class*="up-name"]')?.textContent?.trim() || '',
    description: document.querySelector('.desc-info-text, [class*="desc-info-text"]')?.textContent?.trim()?.slice(0, 1000) || '',
    likes: document.querySelector('[class*="video-like"] [class*="info"], .like [class*="info"]')?.textContent?.trim() || '',
  };
})()
