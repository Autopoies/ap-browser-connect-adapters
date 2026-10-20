(() => {
  // Attaches a file through the upload & tools menu's hidden file input.
  // Requires uploadOpen. Records the attachment baseline for upload-state.js.
  // Structural hooks only: uploader element, input[type=file] and its accept.
  const name = "{{args.name}}" || "attachment.txt";
  const b64 = "{{args.b64}}";
  const lower = name.toLowerCase();
  const isImage = /\.(png|jpe?g|gif|webp|bmp)$/.test(lower);

  const previews = () => document.querySelectorAll("uploader-file-preview").length;
  const baseline = previews();

  const inputs = Array.from(document.querySelectorAll("uploader input[type=\"file\"]"));
  const imageInput = inputs.find((i) => i.getAttribute("accept") === "image/*");
  const docInput = inputs.find((i) => i.getAttribute("accept") !== "image/*");
  const input = isImage ? (imageInput || docInput) : (docInput || imageInput);
  if (!input) {
    window.__apUpload = { error: "file input not found (upload menu not open?)" };
    return window.__apUpload;
  }

  let bytes;
  if (b64 && b64.length > 0) {
    const bin = atob(b64);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } else {
    bytes = new TextEncoder().encode("ap-browser upload placeholder for " + name + "\n");
  }

  const mimeType = lower.endsWith(".png") ? "image/png"
    : /\.jpe?g$/.test(lower) ? "image/jpeg"
    : lower.endsWith(".pdf") ? "application/pdf"
    : lower.endsWith(".md") ? "text/markdown"
    : lower.endsWith(".csv") ? "text/csv"
    : "text/plain";

  const file = new File([bytes], name, { type: mimeType });
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("input", { bubbles: true }));

  window.__apUpload = { baseline, fileName: name, fileSize: bytes.length, mimeType };
  return { ok: true, fileName: name, fileSize: bytes.length, mimeType, baseline };
})();
