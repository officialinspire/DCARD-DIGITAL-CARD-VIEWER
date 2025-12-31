# DCARD Digital Card Viewer (GitHub Pages)

This build adds secure .dcard v2 handling, QR auto-import, and Google Drive hosting through a CORS-friendly Card Gateway that works with static GitHub Pages deployments.

## .dcard v2 schema

Required top-level fields:
- `version`: number (2)
- `name`: card title
- `card`/`assets` payload (existing card content is preserved)
- `fingerprint`: `sha256-` + base64url(sha256(canonical_json_without_fingerprint_and_sig))

Recommended:
- `issuer`: string (ex: `INSPIRE`)
- `issuedAt`: ISO-8601 timestamp
- `sig` (optional strong signing)
  - `alg`: `Ed25519`
  - `keyId`: maps to a trusted public key in `js/verify.js`
  - `signature`: base64url(Ed25519 signature bytes)

### Fingerprint rules
1. Clone the card JSON, remove `fingerprint` and `sig`.
2. Canonicalize objects by sorting keys recursively (arrays keep order).
3. `canonicalString = JSON.stringify(canonicalized)` with no whitespace changes.
4. `hash = sha256(utf8(canonicalString))`.
5. `fingerprint = "sha256-" + base64url(hash)`.

If a card lacks `version`/`fingerprint` it is treated as legacy/UNSIGNED. If `version >= 2` but the fingerprint mismatches, the card is rejected.

### Signature verification
- Ed25519 verification is done in-browser via [`@noble/ed25519`](https://www.npmjs.com/package/@noble/ed25519) (loaded from CDN).
- Trusted keys live in `js/verify.js` (`TRUSTED_KEYS`).
- If a `sig` block is present, verification must pass or the card is marked INVALID (or rejected if STRICT mode is enabled in `js/import.js`).

## Google Drive hosting with Card Gateway

1. Upload your signed `.dcard` files to a single Drive folder. Name files `<fingerprint>.dcard` for clarity.
2. Create a Drive manifest in `cards/index.json` mapping fingerprints to Drive file IDs:
```json
{
  "sha256-example": {
    "driveId": "GOOGLE_DRIVE_FILE_ID",
    "fileName": "sha256-example.dcard",
    "issuer": "INSPIRE"
  }
}
```
3. Deploy the Google Apps Script Web App below as your **Card Gateway** (enable Anyone access):
```js
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doGet(e) {
  try {
    var fileId = e && e.parameter && e.parameter.fileId;
    var fp = e && e.parameter && e.parameter.fp;

    // OPTION 1: direct by fileId
    var file;
    if (fileId) {
      file = DriveApp.getFileById(fileId);
    } else if (fp) {
      // OPTION 2: find by name "<fp>.dcard" (requires cards folder ID configured)
      var folderId = PropertiesService.getScriptProperties().getProperty("CARDS_FOLDER_ID");
      if (!folderId) throw new Error("Missing CARDS_FOLDER_ID script property.");
      var folder = DriveApp.getFolderById(folderId);
      var iter = folder.getFilesByName(fp + ".dcard");
      if (!iter.hasNext()) throw new Error("Card not found by fingerprint: " + fp);
      file = iter.next();
    } else {
      throw new Error("Provide fileId or fp parameter.");
    }

    var content = file.getBlob().getDataAsString("UTF-8");

    // Respond with JSON
    return ContentService.createTextOutput(content)
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type")
      .setHeader("Cache-Control", "public, max-age=3600");
  } catch (err) {
    var out = JSON.stringify({ ok: false, error: String(err) });
    return ContentService.createTextOutput(out)
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}
```

Deployment tips:
- Set `CARDS_FOLDER_ID` in Project Settings → Script Properties (Drive folder containing your `.dcard` files).
- Deploy → Web app → Execute as **Me**, access **Anyone**. Copy the web app URL and set it as `window.DCARD_GATEWAY_URL` if you want a custom default.

## QR auto-import & trade links

- Any URL with `?import=/cards/<fingerprint>.dcard` will auto-import on load.
- The viewer first tries to fetch `/cards/<fingerprint>.dcard` from GitHub Pages; if missing, it reads `/cards/index.json` and fetches from the Card Gateway via Drive `fileId`.
- Trade URLs are generated in-app from the **Trade / Share** button and can be scanned directly. QR codes encode:
  `https://officialinspire.github.io/DCARD-DIGITAL-CARD-VIEWER/?import=/cards/<fingerprint>.dcard`

## Signing tool (issuer side)

A helper script signs cards using Ed25519 and stamps the canonical fingerprint.

```bash
npm install @noble/ed25519
DCARD_PRIVKEY_BASE64URL=<base64url-privkey> node tools/sign-dcard.mjs input.dcard
```

The signed output is written as `<fingerprint>.dcard`. Add the fingerprint to `TRUSTED_KEYS` in `js/verify.js` so the viewer can verify signatures.

## Development notes

- Security helpers live in `js/crypto.js`, `js/verify.js`, and `js/import.js`.
- IndexedDB storage for imported cards is in `js/storage.js` (database `dcard-db`, store `cards`).
- Trade QR rendering uses `js/qr.js` with `qrcode` from jsDelivr.
- The viewer remains static and GitHub Pages friendly (no server code needed).
