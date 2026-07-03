(() => {
  const items = document.querySelectorAll('.interaction-item');
  const out = [];
  items.forEach((item, i) => {
    if (i >= {{args.limit}}) return;
    const user = item.querySelector('.interaction-item__uname')?.textContent?.trim() || '';
    const action = item.querySelector('.interaction-item__action')?.textContent?.trim() || '';
    const reference = item.querySelector('.interaction-item__reference')?.textContent?.trim() || '';
    const content = item.querySelector('.bili-ellipsis')?.textContent?.trim() || '';
    const time = item.querySelector('.interaction-item__time')?.textContent?.trim() || '';
    if (!user) return;
    out.push({ user, action, replied_to: reference, content, time });
  });
  return out;
})()
