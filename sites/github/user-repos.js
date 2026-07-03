(() => {
  const links = [...document.querySelectorAll('a[itemprop="name codeRepository"]')];
  const out = [];
  links.forEach(link => {
    if (out.length >= {{args.limit}}) return;
    let row = link;
    for (let i = 0; i < 6 && row?.parentElement; i++) {
      row = row.parentElement;
      if (row.parentElement && [...row.parentElement.children].filter(s => s.querySelector('a[itemprop="name codeRepository"]')).length > 1) break;
    }
    out.push({
      name: link.textContent.trim(),
      url: link.href,
      description: row.querySelector('p[itemprop="description"]')?.textContent?.trim() || '',
      language: row.querySelector('[itemprop="programmingLanguage"]')?.textContent?.trim() || '',
      stars: row.querySelector('a[href$="/stargazers"]')?.textContent?.trim() || '',
      forks: row.querySelector('a[href$="/forks"]')?.textContent?.trim() || '',
      updated: row.querySelector('relative-time')?.getAttribute('datetime') || '',
    });
  });
  return out;
})()
