(function (global) {
  const DEFAULT_TRUSTED_KEYS = {
    "inspire-main-2025": {
      issuer: "INSPIRE",
      publicKey: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    }
  };

  const ed25519Promise = import('https://cdn.jsdelivr.net/npm/@noble/ed25519@2.1.0/+esm');

  async function verifySignature(cardObj = {}, hashBytes) {
    const sig = cardObj.sig;
    if (!sig) return { ok: false, reason: 'Missing signature' };
    if (sig.alg !== 'Ed25519') return { ok: false, reason: 'Unsupported signature algorithm' };

    const keyEntry = (global.TRUSTED_KEYS || DEFAULT_TRUSTED_KEYS)[sig.keyId];
    if (!keyEntry) return { ok: false, reason: 'Unknown keyId' };

    const { base64urlDecode } = global.DCardCrypto || {};
    if (!base64urlDecode) return { ok: false, reason: 'Crypto helpers unavailable' };

    try {
      const ed25519 = await ed25519Promise;
      const pubKeyBytes = base64urlDecode(keyEntry.publicKey);
      const sigBytes = base64urlDecode(sig.signature);
      const verified = await ed25519.verify(sigBytes, hashBytes, pubKeyBytes);
      return { ok: !!verified, reason: verified ? null : 'Signature mismatch', keyId: sig.keyId };
    } catch (err) {
      return { ok: false, reason: err?.message || 'Verification failed', keyId: sig.keyId };
    }
  }

  global.DCardVerify = {
    TRUSTED_KEYS: DEFAULT_TRUSTED_KEYS,
    verifySignature
  };
})(typeof window !== 'undefined' ? window : globalThis);
