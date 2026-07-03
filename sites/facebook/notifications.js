(() => {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const limit = Number('{{args.limit}}') || 20;
  const lines = (document.body.innerText || '').split('\n').map(clean).filter(Boolean);
  const out = [];
  const timeRe = /^(\d+\s*(分钟|小时|天|周)|\d+\s*(m|h|d|w)|Yesterday|Today)/i;
  for (let i = 0; i < lines.length && out.length < limit; i++) {
    if (lines[i] === '未读' || lines[i] === 'Unread') {
      const text = lines[i + 1] || '';
      const time = timeRe.test(lines[i + 2] || '') ? lines[i + 2] : '';
      if (text && text !== '通知' && text !== 'Notifications') out.push({ text, url: '', time });
    }
  }
  return out;
})()
