(() => {
  const items = document.querySelectorAll('article');
  const out = [];
  items.forEach((a, i) => {
    if (i >= {{args.limit}}) return;
    const modelId = a.querySelector('h4')?.textContent?.trim() || '';
    if (!modelId) return;
    const link = a.querySelector('a[href]');
    const time = a.querySelector('time');
    out.push({
      model_id: modelId,
      url: link?.href || `https://huggingface.co/${modelId}`,
      updated: time?.textContent?.trim() || '',
    });
  });
  return out;
})()
