(() => {
  const d = JSON.parse(document.body.innerText);
  if (d.message) return { error: d.message };
  return {
    sha: d.sha || '',
    message: (d.commit?.message || '').slice(0, 500),
    author: d.commit?.author?.name || d.author?.login || '',
    date: d.commit?.author?.date || '',
    additions: String(d.stats?.additions ?? ''),
    deletions: String(d.stats?.deletions ?? ''),
    files_changed: String((d.files || []).length),
  };
})()
