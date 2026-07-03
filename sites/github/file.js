(() => ({
  repo: '{{args.repo}}',
  path: '{{args.path}}',
  branch: '{{args.branch}}',
  url: location.href,
  content: document.body.innerText.slice(0, 50000),
}))()
