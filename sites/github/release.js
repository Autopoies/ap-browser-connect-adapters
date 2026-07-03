(() => {
  const d = JSON.parse(document.body.innerText);
  if (d.message) return { error: d.message };
  return {
    tag: d.tag_name || '',
    name: d.name || '',
    url: d.html_url || '',
    body: (d.body || '').slice(0, 5000),
    published_at: d.published_at || '',
    draft: !!d.draft,
    prerelease: !!d.prerelease,
  };
})()
