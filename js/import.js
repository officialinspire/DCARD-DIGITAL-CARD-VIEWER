(function (global) {
  const STRICT = false;
  const FALLBACK_GATEWAY = '';

  function isAbsoluteUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  function cleanUrl() {
    const url = new URL(global.location.href);
    url.searchParams.delete('import');
    global.history.replaceState({}, document.title, url.toString());
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch card (${res.status})`);
    return res.json();
  }

  function parseFingerprintFromPath(path) {
    try {
      const parsed = new URL(path, global.location.href);
      path = parsed.pathname;
    } catch {}
    const match = /\/cards\/([^/]+)\.dcard$/i.exec(path || '');
    return match ? match[1] : null;
  }

  async function loadFromGateway(fp, gatewayUrl) {
    const manifestUrl = new URL('cards/index.json', global.location.href).toString();
    const manifest = await fetchJson(manifestUrl);
    const entry = manifest[fp];
    if (!entry) throw new Error('Fingerprint not found in manifest.');
    const base = gatewayUrl || global.DCARD_GATEWAY_URL || FALLBACK_GATEWAY;
    if (!base) throw new Error('Gateway URL not configured.');
    const url = `${base}?fileId=${encodeURIComponent(entry.driveId)}`;
    return fetchJson(url);
  }

  async function resolveCard(importParam, gatewayUrl) {
    if (!importParam) return null;
    let cardUrl = importParam;
    let fingerprint = null;

    if (!isAbsoluteUrl(cardUrl)) {
      const relative = cardUrl.startsWith('/') ? cardUrl.slice(1) : cardUrl;
      cardUrl = new URL(relative, global.location.href).toString();
    }

    fingerprint = parseFingerprintFromPath(cardUrl);

    try {
      return { card: await fetchJson(cardUrl), fingerprint };
    } catch (err) {
      if (fingerprint) {
        return { card: await loadFromGateway(fingerprint, gatewayUrl), fingerprint };
      }
      throw err;
    }
  }

  async function verifyCard(cardObj) {
    const fingerprint = cardObj.fingerprint || cardObj.metadata?.fingerprint || null;
    const hasSignature = !!cardObj.sig;
    const status = hasSignature ? 'unverified' : 'unsigned';
    const reason = 'Fingerprint verification deferred until export or trade';

    return {
      fingerprint,
      unsigned: !hasSignature,
      verified: false,
      reason,
      hashBytes: null,
      status
    };
  }

  async function processImport(importParam, options = {}) {
    const { onCardLoaded, onToast, gatewayUrl } = options;
    if (!importParam) return;

    try {
      const { card } = await resolveCard(importParam, gatewayUrl);
      const security = await verifyCard(card);
      if (global.DCardStorage) {
        try {
          await global.DCardStorage.saveCard({
            fingerprint: security.fingerprint,
            cardObj: card,
            verified: security.verified,
            unsigned: security.unsigned,
            addedAt: new Date().toISOString()
          });
        } catch (err) {
          console.warn('IndexedDB save failed', err);
        }
      }

      if (typeof onCardLoaded === 'function') {
        await onCardLoaded(card, security);
      }

      if (typeof onToast === 'function') {
        onToast('✅ Added to collection from QR import');
      }
    } catch (err) {
      console.error('Import failed', err);
      if (typeof onToast === 'function') {
        onToast(`Import failed: ${err.message || err}`);
      }
    } finally {
      cleanUrl();
    }
  }

  function init(options = {}) {
    const url = new URL(global.location.href);
    const importParam = url.searchParams.get('import');
    if (importParam) {
      setTimeout(() => processImport(importParam, options), 10);
    }
  }

  global.DCardImport = {
    init,
    processImport,
    verifyCard
  };
})(typeof window !== 'undefined' ? window : globalThis);
