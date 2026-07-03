(() => {
  const text = (sel, root = document) => root.querySelector(sel)?.textContent?.trim() || '';
  const meta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.content?.trim() || '';
  const title = meta('og:title') || document.title.replace(/\s*\|.*$/, '').trim() || text('main .title');
  if (!title || title === '找不到了') return [];
  const episodes = [];
  document.querySelectorAll('a[href*="/episode/"]').forEach((a) => {
    if (episodes.length >= {{args.limit}}) return;
    const epTitle = text('.title', a) || a.textContent?.trim().split('\n')[0] || '';
    if (!epTitle) return;
    episodes.push({ title: epTitle, url: a.href, description: text('.description', a), meta: text('.footer', a) });
  });
  return [{
    title,
    author: text('.podcasters .names') || text('.podcasters'),
    subscribers: text('.subscription'),
    description: meta('og:description'),
    episodes
  }];
})()
