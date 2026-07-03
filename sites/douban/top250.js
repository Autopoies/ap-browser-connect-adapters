(() => {
  const items = document.querySelectorAll('#content .item');
  const out = [];
  items.forEach((item, i) => {
    if (i >= {{args.limit}}) return;
    const rank = item.querySelector('.pic em')?.textContent?.trim() || '';
    const link = item.querySelector('.pic a');
    const titles = [...item.querySelectorAll('.hd .title')].map(t => t.textContent.trim());
    const title = (titles[0] || '').replace(/^&nbsp;\//, '').trim();
    const titleEn = (titles[1] || '').replace(/^&nbsp;\//, '').replace(/^\s*\/\s*/, '').trim();
    const rating = item.querySelector('.rating_num')?.textContent?.trim() || '';
    const quote = item.querySelector('.quote')?.textContent?.trim() || '';
    const infoText = item.querySelector('.bd p')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const year = (infoText.match(/\b(\d{4})\b/) || [])[1] || '';
    out.push({
      rank,
      title,
      title_en: titleEn,
      url: link?.href || '',
      rating,
      quote,
      year,
    });
  });
  return out;
})()
