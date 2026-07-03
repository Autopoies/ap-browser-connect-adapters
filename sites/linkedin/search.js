(() => {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const blocked = /authwall|login|signup|checkpoint/.test(location.href) || !!document.querySelector('input[name="session_key"], form[action*="login"]');
  const result = { blocked, note: blocked ? 'LinkedIn login required or auth wall shown.' : '', people: [], companies: [] };
  const add = (bucket, link) => {
    if (result[bucket].length >= {{args.limit}}) return;
    const url = link.href?.split('?')[0] || '';
    if (!url || result[bucket].some((x) => x.url === url)) return;
    const card = link.closest('li, article, section, div[data-test-id]') || link.parentElement || link;
    const title = clean(link.textContent) || clean(card.querySelector('[data-test-id], h2, h3')?.textContent);
    const summary = clean(card.textContent).slice(0, 300);
    result[bucket].push({ title, url, summary });
  };
  document.querySelectorAll('a[href*="/in/"]').forEach((a) => add('people', a));
  document.querySelectorAll('a[href*="/company/"]').forEach((a) => add('companies', a));
  return result;
})()
