(() => {
  const sections = [...document.querySelectorAll('section')];
  const out = [];
  sections.forEach(s => {
    if (out.length >= {{args.limit}}) return;
    const link = s.querySelector('a[href*="/releases/tag/"]');
    const tag = link?.textContent?.trim() || '';
    if (!tag) return;
    const date = s.querySelector('relative-time')?.getAttribute('datetime') || '';
    const body = s.querySelector('.markdown-body, [class*="markdown"]')?.textContent?.trim()?.slice(0, 1500) || '';
    out.push({
      tag,
      url: link.href,
      date,
      body,
    });
  });
  return out;
})()
