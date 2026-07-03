(() => {
  const data = JSON.parse(document.body.innerText);
  if (!Array.isArray(data)) return [];
  return data.slice(0, {{args.limit}}).map(t => ({
    name: t.name || '',
    commit_sha: t.commit?.sha || '',
  }));
})()
