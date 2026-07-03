(() => {
  const paras = [...document.querySelectorAll('#mw-content-text p')]
    .filter(p => p.textContent.trim() && !p.classList.contains('mw-empty-elt'));
  const summary = paras.slice(0, 3).map(p => p.textContent.trim()).join(' ');
  return {
    title: document.querySelector('h1')?.textContent?.trim() || '',
    url: location.href,
    summary: summary.slice(0, 1000),
  };
})()
