(() => {
  const lis = [...document.querySelectorAll('li')].filter(li => /CommitRow/.test(li.className));
  const out = [];
  lis.forEach(li => {
    if (out.length >= {{args.limit}}) return;
    const link = li.querySelector('a[href*="/commit/"]');
    if (!link) return;
    const sha = (link.href.match(/\/commit\/([a-f0-9]+)$/) || [])[1]?.slice(0, 7) || '';
    const author = li.querySelector('a[data-testid="author"], img[alt]')?.textContent?.trim() || li.querySelector('img[alt]')?.getAttribute('alt') || '';
    out.push({
      sha,
      message: link.textContent.trim().slice(0, 200),
      url: link.href,
      author,
      date: li.querySelector('relative-time')?.getAttribute('datetime') || '',
    });
  });
  return out;
})()
