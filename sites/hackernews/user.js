(() => {
  const rows = document.querySelectorAll('td:nth-child(1)');
  const fields = {};
  rows.forEach(td => {
    const label = td.textContent.trim().replace(/:$/, '');
    const val = td.nextElementSibling?.textContent?.trim();
    if (label && val && label !== 'top') fields[label] = val;
  });
  return {
    id: fields.user || '',
    created: fields.created || '',
    karma: fields.karma || '',
    about: fields.about || '',
  };
})()
