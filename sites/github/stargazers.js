(() => {
  const links = [...document.querySelectorAll('h3 a')];
  const out = [];
  links.forEach(a => {
    if (out.length >= {{args.limit}}) return;
    const username = (a.pathname.match(/\/([^/]+)$/) || [])[1] || '';
    if (!username || username === 'stargazers') return;
    out.push({ username, url: a.href });
  });
  return out;
})()
