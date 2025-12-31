(function (global) {
  const DB_NAME = 'dcard-db';
  const STORE_NAME = 'cards';
  const VERSION = 1;

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in global)) {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'fingerprint' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveCard(record) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const payload = { ...record, addedAt: record.addedAt || new Date().toISOString() };
      store.put(payload);
      tx.oncomplete = () => resolve(payload);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getCard(fingerprint) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fingerprint);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function listCards() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  global.DCardStorage = { openDatabase, saveCard, getCard, listCards };
})(typeof window !== 'undefined' ? window : globalThis);
