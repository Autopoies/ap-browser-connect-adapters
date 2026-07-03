(() => {
  const data = JSON.parse(document.body.innerText);
  if (!Array.isArray(data)) return [];
  return data.slice(0, {{args.limit}}).map(e => {
    let summary = '';
    const p = e.payload || {};
    if (e.type === 'PushEvent') {
      summary = `pushed ${(p.commits || []).length} commits to ${(p.ref || '').replace('refs/heads/', '')}`;
    } else if (e.type === 'CreateEvent') {
      summary = `created ${p.ref_type || ''} ${p.ref || ''}`;
    } else if (e.type === 'WatchEvent') {
      summary = 'starred';
    } else if (e.type === 'ForkEvent') {
      summary = 'forked';
    } else if (e.type === 'IssuesEvent') {
      summary = `${p.action || ''} issue`;
    } else if (e.type === 'PullRequestEvent') {
      summary = `${p.action || ''} PR`;
    } else if (e.type === 'IssueCommentEvent') {
      summary = `commented on ${(p.issue?.title || '').slice(0, 50)}`;
    } else if (e.type === 'ReleaseEvent') {
      summary = `released ${(p.release?.tag_name || '')}`;
    } else {
      summary = e.type;
    }
    return {
      type: e.type || '',
      repo: e.repo?.name || '',
      created_at: e.created_at || '',
      payload_summary: summary,
    };
  });
})()
