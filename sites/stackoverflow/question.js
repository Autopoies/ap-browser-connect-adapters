(() => {
  const title = document.querySelector('#question-header h1, h1.fs-headline1')?.textContent?.trim() || document.title;
  const body = document.querySelector('#question .js-post-body, #question .post-text')?.textContent?.trim()?.slice(0, 2000) || '';
  const answers = [...document.querySelectorAll('#answers .answer, .answer')]
    .slice(0, {{args.limit}})
    .map(a => {
      const score = a.querySelector('.js-vote-count, .vote-count-post')?.textContent?.trim() || '';
      const body = a.querySelector('.js-post-body, .post-text')?.textContent?.trim()?.slice(0, 2000) || '';
      return { score, body };
    })
    .filter(a => a.body);
  return {
    id: location.href.match(/\/questions\/(\d+)/)?.[1] || '',
    title,
    body,
    answers,
  };
})()
