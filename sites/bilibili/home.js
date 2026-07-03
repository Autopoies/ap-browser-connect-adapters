(() => {
  const cards = [...document.querySelectorAll('.bili-video-card')];
  const real = cards.filter(c =>
    c.querySelector('.bili-video-card__info--tit') &&
    !c.querySelector('a[href*="cm.bilibili"]')
  );
  const out = [];
  real.forEach((v, i) => {
    if (i >= {{args.limit}}) return;
    const title = v.querySelector('.bili-video-card__info--tit')?.textContent?.trim() || '';
    if (!title) return;
    const href = v.querySelector('a[href*="bilibili.com/video"]')?.href
      || v.querySelector('.bili-video-card__info--tit a')?.href
      || v.querySelector('a[href]')?.href || '';
    const bvid = href.match(/BV\w+/)?.[0] || '';
    const up = v.querySelector('.bili-video-card__info--author')?.textContent?.trim() || '';
    const duration = v.querySelector('.bili-video-card__stats__duration')?.textContent?.trim() || '';
    out.push({ title, bvid, url: href, up, duration });
  });
  return out;
})()
