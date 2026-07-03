(() => {
  const code = document.querySelector('.blob-wrapper, .markdown-body, .highlight')?.textContent?.trim() || '';
  const files = [...document.querySelectorAll('.file-header, .gist-blob-name')]
    .map(f => f.textContent.replace(/\s+/g, ' ').trim())
    .filter(t => t && !/raw/i.test(t));
  return {
    id: location.href.match(/\/([a-f0-9]{20,})/)?.[1] || '',
    url: location.href,
    files,
    content: code.slice(0, 50000),
  };
})()
