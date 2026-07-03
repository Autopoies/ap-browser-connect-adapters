(() => {
  const titleRaw = document.querySelector('.title, h1.title')?.textContent?.trim() || '';
  const title = titleRaw.replace(/^Title:\s*/, '').replace(/^Abstract:/, '').trim();
  const abstractRaw = document.querySelector('.abstract')?.textContent?.replace(/\s+/g, ' ').trim() || '';
  const abstract = abstractRaw.replace(/^Abstract:\s*/, '').trim();
  return {
    id: location.href.match(/\/abs\/([\d.]+)/)?.[1] || '',
    title,
    authors: [...document.querySelectorAll('.authors a')].map(a => a.textContent.trim()),
    abstract,
    subjects: [...document.querySelectorAll('.primary-subject')].map(t => t.textContent.trim()),
    date: document.querySelector('.dateline')?.textContent?.trim() || '',
    pdf_url: document.querySelector('a[href$=".pdf"]')?.href || '',
  };
})()
