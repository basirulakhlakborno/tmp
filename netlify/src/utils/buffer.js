// Buffer / binary helpers

export function arrayBufferToBase64(buffer) {
  if (!buffer) return '';
  return Buffer.from(buffer instanceof ArrayBuffer ? Buffer.from(buffer) : buffer).toString('base64');
}

