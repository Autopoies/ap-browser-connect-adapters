(() => {
  // Ready once the attached file's name shows up in the composer. The name is
  // the file we just attached (data), so this check does not depend on UI language.
  const name = (window.__apMuseUpload || {}).fileName;
  if (!name) return { ready: false, error: "no upload recorded" };
  return { ready: (document.body.textContent || "").includes(name), fileName: name };
})();
