// src/utils/hash.js
export async function sha256(arrayBuffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return (
      '0x' +
      [...new Uint8Array(hashBuffer)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );
  }
  