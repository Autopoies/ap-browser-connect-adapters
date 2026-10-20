(() => {
  // Structural: the composer's hidden file input. No text matching.
  const input = document.querySelector('input[type="file"]');
  if (!input) return { ok: false, error: "file input element not found" };

  let fileName = "{{args.name}}";
  if (!fileName || fileName === "attachment.png") {
    fileName = `upload_${Date.now()}.png`;
  } else {
    const parts = fileName.split(".");
    const ext = parts.length > 1 ? parts.pop() : "";
    fileName = ext ? `${parts.join(".")}_${Date.now()}.${ext}` : `${fileName}_${Date.now()}`;
  }

  const b64Data = `{{args.b64}}`;
  let bytes;
  if (b64Data && b64Data.length > 0) {
    const binaryStr = atob(b64Data);
    bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  } else {
    // Valid 1x1 PNG fallback
    bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 213, 196, 203, 0, 0, 0, 10, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
  }

  const lower = fileName.toLowerCase();
  const mimeType = lower.endsWith(".png")
    ? "image/png"
    : lower.endsWith(".jpg") || lower.endsWith(".jpeg")
      ? "image/jpeg"
      : lower.endsWith(".pdf")
        ? "application/pdf"
        : "text/plain";

  const file = new File([bytes], fileName, { type: mimeType });
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("input", { bubbles: true }));

  // Remember what was attached: upload-state.js / upload-verify.js look for this name.
  window.__apMuseUpload = { fileName, fileSize: bytes.length, mimeType };
  return { ok: true, fileName, fileSize: bytes.length, mimeType };
})();
