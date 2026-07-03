(() => {
  const titleEl = document.querySelector('.titleline a');
  const comments = [...document.querySelectorAll('.comtrt')]
    .map(c => {
      const user = c.querySelector('.hnuser')?.textContent?.trim() || '';
      const text = c.querySelector('.commtext')?.textContent?.trim() || '';
      const age = c.querySelector('.age a')?.textContent?.trim() || '';
      return { user, age, text: text.slice(0, 500) };
    })
    .filter(c => c.user || c.text);
  return {
    id: location.href.match(/id=(\d+)/)?.[1] || '',
    title: titleEl?.textContent?.trim() || '',
    url: titleEl?.href || '',
    points: document.querySelector('.score')?.textContent?.trim() || '',
    user: document.querySelector('.hnuser')?.textContent?.trim() || '',
    age: document.querySelector('.age a')?.textContent?.trim() || '',
    body: document.querySelector('.toptext')?.textContent?.trim()?.slice(0, 1000) || '',
    comments,
  };
})()
