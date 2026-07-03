(() => {
  const labels = [...document.querySelectorAll('label')];
  const fields = {};
  labels.forEach(l => {
    const key = l.textContent.trim().toLowerCase();
    const val = l.nextElementSibling?.textContent?.trim() || '';
    if (key && val) fields[key] = val;
  });
  return {
    username: '{{args.username}}',
    status: fields['status'] || '',
    joined: fields['joined'] || '',
    karma: fields['karma'] || '',
    stories: fields['stories submitted'] || '',
    comments: fields['comments posted'] || '',
    homepage: fields['homepage'] || '',
    github: fields['github'] || '',
    about: document.querySelector('#about, [id="about"]')?.textContent?.trim() || '',
  };
})()
