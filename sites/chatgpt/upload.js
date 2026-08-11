(() => {
  // Dismiss any existing modal dialogs (e.g. duplicate file warning)
  const modalBtns = Array.from(document.querySelectorAll('button, div[role="button"]')).filter(b => {
    const text = (b.innerText || '').trim();
    return text === '确定' || text === 'OK' || text === 'Dismiss' || text === 'Close';
  });
  modalBtns.forEach(b => b.click());

  let fileName = '{{args.name}}';
  if (!fileName || fileName === 'attachment.png') {
    fileName = `upload_${Date.now()}.png`;
  } else {
    const parts = fileName.split('.');
    const ext = parts.pop();
    fileName = `${parts.join('.')}_${Date.now()}.${ext}`;
  }

  const b64Data = `{{args.b64}}`;
  const uploadType = '{{args.type}}'.toLowerCase();

  const selector = uploadType.includes('photo') || uploadType.includes('image') ? '#upload-photos' : '#upload-files';
  const input = document.querySelector(selector) || document.querySelector('#upload-photos') || document.querySelector('#upload-files') || document.querySelector('input[type="file"]');

  if (!input) return { ok: false, error: 'file input element not found' };

  let bytes;
  if (b64Data && b64Data.length > 0) {
    const binaryStr = atob(b64Data);
    const len = binaryStr.length;
    bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
  } else {
    // Valid 1x1 PNG binary fallback
    bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 213, 196, 203, 0, 0, 0, 10, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
  }

  const mimeType = fileName.endsWith('.png') ? 'image/png' : fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? 'image/jpeg' : fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain';

  const file = new File([bytes], fileName, { type: mimeType });
  const container = new DataTransfer();
  container.items.add(file);
  input.files = container.files;

  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('input', { bubbles: true }));

  return { ok: true, fileName, fileSize: bytes.length, type: uploadType };
})()
