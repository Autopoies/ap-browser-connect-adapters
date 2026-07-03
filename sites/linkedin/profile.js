(() => {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const blocked = /authwall|login|signup|checkpoint/.test(location.href) || !!document.querySelector('input[name="session_key"], form[action*="login"]');
  const main = document.querySelector('main') || document.body;
  const sectionText = (needle) => {
    const sections = [...main.querySelectorAll('section, article, div[data-test-id]')];
    const section = sections.find((el) => clean(el.querySelector('h2, h3')?.textContent).toLowerCase().includes(needle));
    return clean(section?.textContent).slice(0, 800);
  };
  return {
    blocked,
    note: blocked ? 'LinkedIn login required or auth wall shown.' : '',
    name: clean(main.querySelector('h1')?.textContent),
    headline: clean(main.querySelector('[data-test-id*="headline"], header h2, header p')?.textContent),
    about: sectionText('about'),
    experience: sectionText('experience'),
  };
})()
