(() => {
  const videos = document.querySelectorAll('ytd-rich-item-renderer');
  const out = [];
  videos.forEach((v, i) => {
    if (i >= {{args.limit}}) return;
    const title = v.querySelector('.ytLockupMetadataViewModelTitle')?.textContent?.trim() || '';
    if (!title) return;
    const url = v.querySelector('a[href*="/watch"]')?.href || '';
    const videoId = url.match(/v=([\w-]{11})/)?.[1] || '';
    const channel = v.querySelector('a[href*="/@"]')?.textContent?.trim() || '';
    const duration = v.querySelector('.ytBadgeShapeText')?.textContent?.trim() || '';
    const metaTexts = [...v.querySelectorAll('.ytContentMetadataViewModelMetadataText')]
      .map(s => s.textContent.trim())
      .filter(t => t);
    const unique = [...new Set(metaTexts)];
    const views = unique.find(t => t !== channel) || '';
    const date = unique.filter(t => t !== channel && t !== views)[0] || '';
    out.push({ title, video_id: videoId, url, channel, views, duration, date });
  });
  return out;
})()
