(() => {
  const name = document.querySelector('h1')?.textContent?.trim() || '';
  const readme = document.querySelector('#readme')?.textContent?.trim()?.slice(0, 10000) || '';
  return {
    name,
    url: location.href,
    readme,
  };
})()
