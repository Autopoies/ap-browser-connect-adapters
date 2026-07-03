(() => {
  const items = [...document.querySelectorAll('.TopstoryItem')]
    .filter(i => !i.classList.contains('TopstoryItem--advertCard') && !i.querySelector('.Pc-feedAd-new'));
  const out = [];
  items.forEach((item, i) => {
    if (i >= {{args.limit}}) return;
    const title = item.querySelector('.ContentItem-title')?.textContent?.trim() || '';
    if (!title) return;
    const link = item.querySelector('.ContentItem-title a, a[data-za-detail-view-element_name="Title"]');
    const author = item.querySelector('.AuthorInfo-name, .UserLink-link')?.textContent?.trim() || '';
    const excerpt = item.querySelector('.RichText')?.textContent?.trim()?.slice(0, 200) || '';
    out.push({
      title,
      url: link?.href || '',
      author,
      excerpt,
    });
  });
  return out;
})()
