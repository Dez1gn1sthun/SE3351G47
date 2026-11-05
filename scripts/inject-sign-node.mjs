#!/usr/bin/env node
/**
 * Adds (or repositions) the `sign` empty inside a GLB.
 *
 * The campus export has no `sign` object, but the site needs a 3D anchor for
 * the marker UI. Editing the JSON chunk directly keeps every byte of geometry,
 * material and texture data untouched — only one extra node is appended.
 *
 * The .blend source gets the same empty through scripts/add-sign-to-blend.py;
 * re-run this script after any re-export that drops it.
 *
 * Usage: npm run sign -- [file.glb] [x,y,z]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const SIGN_NAME = 'sign';

const file = process.argv[2] ?? 'public/models/eng-campus.glb';
const coords = (process.argv[3] ?? '54.5,4,34').split(',').map(Number);

if (coords.length !== 3 || coords.some((n) => !Number.isFinite(n))) {
  console.error('usage: node scripts/inject-sign-node.mjs [file.glb] [x,y,z]');
  process.exit(1);
}

const glb = readFileSync(file);
if (glb.readUInt32LE(0) !== GLB_MAGIC) {
  throw new Error(`${file} is not a GLB file`);
}

const jsonLength = glb.readUInt32LE(12);
let json;
try {
  json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8'));
} catch (error) {
  throw new Error(`${file} has a corrupt JSON chunk: ${String(error)}`);
}
// BIN chunk header + payload, re-emitted byte for byte.
const rest = glb.subarray(20 + jsonLength);

json.nodes ??= [];
json.scenes ??= [{ nodes: [] }];
const scene = json.scenes[json.scene ?? 0];
scene.nodes ??= [];

let index = json.nodes.findIndex((node) => node.name === SIGN_NAME);

if (index === -1) {
  index = json.nodes.push({ name: SIGN_NAME, translation: coords }) - 1;
  console.log(`added "${SIGN_NAME}" as node ${index} at ${coords.join(', ')}`);
} else {
  const node = json.nodes[index];
  node.translation = coords;
  delete node.matrix;
  console.log(`moved existing "${SIGN_NAME}" (node ${index}) to ${coords.join(', ')}`);
}

if (!scene.nodes.includes(index)) scene.nodes.push(index);

const jsonBytes = Buffer.from(JSON.stringify(json), 'utf8');
const padding = (4 - (jsonBytes.length % 4)) % 4;
const padded = Buffer.concat([jsonBytes, Buffer.alloc(padding, 0x20)]);

const header = Buffer.alloc(12);
header.writeUInt32LE(GLB_MAGIC, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + padded.length + rest.length, 8);

const chunkHeader = Buffer.alloc(8);
chunkHeader.writeUInt32LE(padded.length, 0);
chunkHeader.writeUInt32LE(CHUNK_JSON, 4);

writeFileSync(file, Buffer.concat([header, chunkHeader, padded, rest]));
console.log(`wrote ${file}`);
