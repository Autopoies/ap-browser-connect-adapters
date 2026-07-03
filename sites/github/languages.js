(() => {
  const data = JSON.parse(document.body.innerText);
  const languages = [];
  for (const [name, bytes] of Object.entries(data)) {
    languages.push({ name, bytes });
  }
  return {
    repo: '{{args.repo}}',
    languages,
  };
})()
