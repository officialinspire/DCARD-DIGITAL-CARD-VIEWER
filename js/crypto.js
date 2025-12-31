(function (global) {
  const encoder = new TextEncoder();

  function base64urlEncode(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function base64urlDecode(str) {
    const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    const base64 = normalized + padding;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function canonicalize(value) {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(canonicalize);

    const sortedKeys = Object.keys(value).sort();
    const result = {};
    for (const key of sortedKeys) {
      result[key] = canonicalize(value[key]);
    }
    return result;
  }

  function canonicalStringify(obj) {
    return JSON.stringify(canonicalize(obj));
  }

  async function sha256Bytes(str) {
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }

  async function computeFingerprint(cardObj = {}) {
    const clone = JSON.parse(JSON.stringify(cardObj));
    if (clone && typeof clone === 'object') {
      delete clone.fingerprint;
      delete clone.sig;
    }
    const canonicalStr = canonicalStringify(clone);
    const hashBytes = await sha256Bytes(canonicalStr);
    const fingerprint = `sha256-${base64urlEncode(hashBytes)}`;
    return { fingerprint, hashBytes };
  }

  async function verifyFingerprint(cardObj = {}) {
    if (!cardObj || !cardObj.fingerprint) return { ok: false, computedFp: null, hashBytes: null };
    const { fingerprint, hashBytes } = await computeFingerprint(cardObj);
    return { ok: fingerprint === cardObj.fingerprint, computedFp: fingerprint, hashBytes };
  }

  global.DCardCrypto = {
    base64urlEncode,
    base64urlDecode,
    canonicalize,
    canonicalStringify,
    sha256Bytes,
    computeFingerprint,
    verifyFingerprint
  };
})(typeof window !== 'undefined' ? window : globalThis);
