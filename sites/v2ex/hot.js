(() => {
  const items = document.querySelectorAll('.cell.item');
  return [...items].map(item => ({
    title: item.querySelector('.item_title a')?.textContent?.trim() || '',
    url: item.querySelector('.item_title a')?.href || '',
    node: item.querySelector('.node')?.textContent?.trim() || '',
    author: item.querySelector('.topic_info strong a')?.textContent?.trim() || '',
    replies: item.querySelector('.count_livid')?.textContent?.trim() || '',
  }));
})()
