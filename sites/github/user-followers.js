(() => {
  const links = [...document.querySelectorAll('a[data-hovercard-type="user"]')];
  const seen = new Set();
  const out = [];
  links.forEach(a => {
    if (out.length >= {{args.limit}}) return;
    const username = (a.pathname.match(/\/([^/]+)$/) || [])[1] || '';
    if (!username || seen.has(username)) return;
    seen.add(username);
    out.push({
      username,
      name: a.querySelector('.Link__primary, [class*="primary"]')?.textContent?.trim() || username,
      url: a.href,
    });
  });
  return out;
})()
