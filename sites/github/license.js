(() => {
  const data = JSON.parse(document.body.innerText);
  if (data.message) return { repo: '{{args.repo}}', license_name: '', spdx_id: '', license_url: '', error: data.message };
  return {
    repo: '{{args.repo}}',
    license_name: data.license?.name || '',
    spdx_id: data.license?.spdx_id || '',
    license_url: data.html_url || '',
  };
})()
