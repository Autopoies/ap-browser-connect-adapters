(() => {
  const nameRaw = document.querySelector('.package-header__name')?.textContent?.trim() || '';
  const [name, version] = nameRaw.split(/\s+/);
  const desc = document.querySelector('.package-description__summary')?.textContent?.trim() || '';
  const dateEl = document.querySelector('#description time, time[datetime]');
  return {
    name: name || '',
    version: version || '',
    description: desc,
    release_date: dateEl?.getAttribute('datetime') || '',
  };
})()
