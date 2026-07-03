(() => {
  const items = document.querySelectorAll('.interaction-item');
  const out = [];
  items.forEach((item, i) => {
    if (i >= {{args.limit}}) return;
    const users = [...item.querySelectorAll('.interaction-item__uname')]
      .map(a => a.textContent.trim()).filter(Boolean);
    const action = item.querySelector('.interaction-item__action')?.textContent?.trim() || '';
    const content = item.querySelector('.bili-ellipsis')?.textContent?.trim() || '';
    const time = item.querySelector('.interaction-item__time')?.textContent?.trim() || '';
    if (!users.length) return;
    out.push({ users: users.join(', '), action, content, time });
  });
  return out;
})()
