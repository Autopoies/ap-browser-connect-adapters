(() => {
  const limit = {{args.limit}};
  return [...document.querySelectorAll('[data-testid="trend"]')].map(trend => {
    const lines = trend.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const ranked = /^\d+$/.test(lines[0] || '');
    const category = ranked ? (lines[2] || '') : (lines[0] || '');
    const topic = ranked ? (lines[3] || '') : (lines[1] || '');
    const posts = lines.find(s => /(?:posts?|\u5e16\u5b50)$/i.test(s)) || '';
    return { topic, category, posts, url: trend.querySelector('a[href]')?.href || '' };
  }).filter(t => t.topic).slice(0, limit);
})()
