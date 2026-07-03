(() => {
  const links = [...document.querySelectorAll('a[href*="/t/"]')]
    .filter(a => a.textContent.trim() && !/^\d+$/.test(a.textContent.trim()));
  const out = [];
  const seen = new Set();
  links.forEach(a => {
    if (out.length >= {{args.limit}}) return;
    const id = (a.href.match(/\/t\/(\d+)/) || [])[1];
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push({
      title: a.textContent.trim(),
      url: a.href,
    });
  });
  return out;
})()
