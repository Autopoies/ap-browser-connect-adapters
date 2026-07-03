(() => {
  const cards = document.querySelectorAll('.bili-video-card');
  return [...cards].map(c => ({
    title: c.querySelector('.bili-video-card__info--tit')?.textContent?.trim() || '',
    bvid: c.querySelector('a')?.href?.match(/BV\w+/)?.[0] || '',
    up: c.querySelector('.bili-video-card__info--author')?.textContent?.trim() || '',
    plays: c.querySelector('.bili-video-card__info--stats-item')?.textContent?.trim() || '',
    danmaku: c.querySelectorAll('.bili-video-card__info--stats-item')[1]?.textContent?.trim() || '',
  }));
})()
