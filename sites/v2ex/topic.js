(() => {
  const replies = [...document.querySelectorAll('.reply_content')]
    .slice(0, {{args.limit}})
    .map(r => {
      const cell = r.closest('.cell, [class*="reply"]');
      const user = cell?.querySelector('.dark, a[href*="/member/"]')?.textContent?.trim() || '';
      const text = r.textContent?.trim()?.slice(0, 500) || '';
      return { user, text };
    })
    .filter(r => r.text);
  return {
    id: location.href.match(/\/t\/(\d+)/)?.[1] || '',
    title: document.querySelector('h1')?.textContent?.trim() || '',
    content: document.querySelector('.topic_content')?.textContent?.trim()?.slice(0, 2000) || '',
    replies,
  };
})()
