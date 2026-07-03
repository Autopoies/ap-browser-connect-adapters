(() => {
  const title = document.querySelector('.QuestionHeader-title, h1.QuestionHeader-title')?.textContent?.trim() || '';
  const detail = document.querySelector('.QuestionRichText, .QuestionHeader-detail .RichText')?.textContent?.trim()?.slice(0, 500) || '';
  const answers = [...document.querySelectorAll('.List-item, .AnswerItem')]
    .slice(0, {{args.limit}})
    .map(a => {
      const author = a.querySelector('.AuthorInfo-name, .UserLink-link')?.textContent?.trim() || '';
      const content = a.querySelector('.RichContent-inner .RichText, .RichContent-inner')?.textContent?.trim()?.slice(0, 1000) || '';
      const voteup = a.querySelector('.VoteButton--up, [class*="VoteButton"]')?.textContent?.trim() || '';
      return { author, content, voteup };
    })
    .filter(a => a.content);
  return {
    id: location.href.match(/question\/(\d+)/)?.[1] || '',
    title,
    detail,
    answers,
  };
})()
