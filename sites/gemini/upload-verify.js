(() => {
  // Reports the attachment chip(s) now in the composer. Nothing is sent.
  const state = window.__apUpload || {};
  if (state.error) return { ok: false, error: state.error };
  const previews = Array.from(document.querySelectorAll("uploader-file-preview"));
  const last = previews[previews.length - 1];
  const textOf = (sel) => {
    const el = last ? last.querySelector(sel) : null;
    return el ? (el.innerText || "").trim() : "";
  };
  const ok = typeof state.baseline === "number" && previews.length > state.baseline;
  return {
    ok,
    fileName: state.fileName || textOf(".gem-attachment-text"),
    chipText: textOf(".gem-attachment-text"),
    extension: textOf(".gem-attachment-extension-label"),
    fileSize: state.fileSize || 0,
    mimeType: state.mimeType || "",
    attachments: previews.length,
  };
})();
