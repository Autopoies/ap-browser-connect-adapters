(() => {
  // Ready once the attachment count exceeds the baseline recorded in upload-set-file.js.
  const count = document.querySelectorAll("uploader-file-preview").length;
  const baseline = (window.__apUpload || {}).baseline;
  const error = (window.__apUpload || {}).error;
  return {
    ready: typeof baseline === "number" && count > baseline,
    attachments: count,
    error: error || null,
  };
})();
