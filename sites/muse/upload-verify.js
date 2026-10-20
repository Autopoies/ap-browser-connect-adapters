(() => {
  const up = window.__apMuseUpload || {};
  if (!up.fileName) return { ok: false, error: "no upload recorded" };
  const present = (document.body.textContent || "").includes(up.fileName);
  return { ok: present, fileName: up.fileName, fileSize: up.fileSize || 0, mimeType: up.mimeType || "" };
})();
