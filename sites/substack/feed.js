(() => {
  const out = [];
  const seen = new Set();
  document.querySelectorAll('a[href*="/p/"], a[href*="/note/"]').forEach((link) => {
    if (out.length >= {{args.limit}}) return;
    const url = link.href?.split('?')[0] || '';
    if (!url || seen.has(url)) return;
    const raw = link.textContent?.trim() || '';
    const title = raw.split('\n').map(s => s.trim()).filter(Boolean).pop() || raw;
    if (!title) return;
    seen.add(url);
    const card = link.closest('div')?.parentElement || link.closest('div') || link;
    const publication = card.querySelector('a[href$=".substack.com/"], a[href*=".substack.com/"]')?.textContent?.trim() || '';
    const author = card.querySelector('a[href*="substack.com/@"]')?.textContent?.trim() || '';
    out.push({ title, url, publication, author });
  });
  return out;
})()
