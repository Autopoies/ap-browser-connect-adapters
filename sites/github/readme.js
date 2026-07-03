(() => {
  const readme = document.querySelector('article.markdown-body, [class*="README"]');
  return {
    repo: '{{args.repo}}',
    url: location.href,
    readme: readme?.textContent?.trim()?.slice(0, 10000) || '',
  };
})()
