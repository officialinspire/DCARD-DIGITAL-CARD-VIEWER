#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import * as ed25519 from '@noble/ed25519';

function base64urlEncode(bytes) {
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64urlDecode(str) {
  const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, 'base64');
}

function canonicalize(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  const sortedKeys = Object.keys(value).sort();
  const out = {};
  for (const k of sortedKeys) out[k] = canonicalize(value[k]);
  return out;
}

function canonicalStringify(obj) {
  return JSON.stringify(canonicalize(obj));
}

function computeFingerprint(card) {
  const clone = JSON.parse(JSON.stringify(card));
  delete clone.fingerprint;
  delete clone.sig;
  const canonical = canonicalStringify(clone);
  const hash = createHash('sha256').update(canonical, 'utf8').digest();
  return { fingerprint: `sha256-${base64urlEncode(hash)}`, hashBytes: hash };
}

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath) {
    console.error('Usage: node tools/sign-dcard.mjs <input.dcard> [output.dcard]');
    process.exit(1);
  }

  const raw = await fs.readFile(inputPath, 'utf8');
  const card = JSON.parse(raw);
  const { fingerprint, hashBytes } = computeFingerprint(card);
  card.fingerprint = fingerprint;

  const privKeyB64 = process.env.DCARD_PRIVKEY_BASE64URL;
  if (!privKeyB64) {
    console.error('Missing DCARD_PRIVKEY_BASE64URL env var for signing.');
    process.exit(1);
  }
  const privateKey = base64urlDecode(privKeyB64);
  const signature = await ed25519.sign(hashBytes, privateKey);

  card.sig = {
    alg: 'Ed25519',
    keyId: card.sig?.keyId || 'inspire-main-2025',
    signature: base64urlEncode(signature)
  };

  const outPath = outputPath || path.join(path.dirname(inputPath), `${fingerprint}.dcard`);
  await fs.writeFile(outPath, JSON.stringify(card, null, 2));
  console.log(`Signed card written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
