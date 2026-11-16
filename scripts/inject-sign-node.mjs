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
// Import functions for reading and writing files.
import { readFileSync, writeFileSync } from 'node:fs';

// GLB file format constants.
// GLB_MAGIC identifies a valid GLB file.
const GLB_MAGIC = 0x46546c67;

// CHUNK_JSON identifies the JSON chunk inside a GLB file.
const CHUNK_JSON = 0x4e4f534a;

// Name of the node that this script will add or reposition.
const SIGN_NAME = 'sign';

// Get the GLB file path from the command-line arguments.
// If no file is provided, use the default campus model.
const file = process.argv[2] ?? 'client/public/models/eng-campus.glb';

// Get the sign's x, y, and z coordinates from the command line.
// If no coordinates are provided, use the default position.
const coords = (process.argv[3] ?? '54.5,4,34').split(',').map(Number);

// Check that exactly three valid numbers were provided.
// The coordinates must represent x, y, and z.
if (coords.length !== 3 || coords.some((n) => !Number.isFinite(n))) {
  console.error('usage: node scripts/inject-sign-node.mjs [file.glb] [x,y,z]');

  // Stop the program if the coordinates are invalid.
  process.exit(1);
}

// Read the entire GLB file into memory as a Buffer.
const glb = readFileSync(file);

// Check the first four bytes of the file.
// They must match the GLB magic number to confirm it is a GLB file.
if (glb.readUInt32LE(0) !== GLB_MAGIC) {
  throw new Error(`${file} is not a GLB file`);
}

// Read the JSON chunk's length from the GLB header.
// The length is stored at byte offset 12.
const jsonLength = glb.readUInt32LE(12);

let json;

// Extract the JSON chunk and convert it into a JavaScript object.
try {
  // The JSON data starts at byte 20 and continues for jsonLength bytes.
  // JSON.parse converts the JSON text into a JavaScript object.
  json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8'));
} catch (error) {
  // Stop the program if the JSON data cannot be read or parsed.
  throw new Error(`${file} has a corrupt JSON chunk: ${String(error)}`);
}

// Store everything after the JSON chunk.
// This contains the BIN chunk header and binary data, which hold
// the model's geometry, materials, textures, and other binary resources.
// Keeping these bytes unchanged preserves the original model data.
const rest = glb.subarray(20 + jsonLength);

// Make sure the nodes array exists in the GLB JSON.
// Nodes represent objects or elements in the 3D scene.
json.nodes ??= [];

// Make sure the scenes array exists.
// If it does not exist, create a default scene with an empty node list.
json.scenes ??= [{ nodes: [] }];

// Get the active scene using the scene index.
// If json.scene is missing, use scene 0.
const scene = json.scenes[json.scene ?? 0];

// Make sure the active scene has a nodes array.
scene.nodes ??= [];

// Search through the existing nodes to see whether a node named "sign" exists.
// findIndex returns the node's position in the array, or -1 if it is not found.
let index = json.nodes.findIndex((node) => node.name === SIGN_NAME);

// Check whether the sign node already exists.
if (index === -1) {
  // Create a new node with the name "sign" and the specified coordinates.
  // push adds the node to the end of the nodes array.
  // It returns the new array length, so subtract 1 to get its index.
  index = json.nodes.push({ name: SIGN_NAME, translation: coords }) - 1;

  // Display a message indicating that a new sign node was added.
  console.log(`added "${SIGN_NAME}" as node ${index} at ${coords.join(', ')}`);
} else {
  // Get the existing sign node using its index.
  const node = json.nodes[index];

  // Update the existing node's position with the new coordinates.
  node.translation = coords;

  // Remove the matrix property, if present.
  // This allows the node's position to be controlled by its translation,
  // rather than its previous transformation matrix.
  delete node.matrix;

  // Display a message indicating that the existing sign node was moved.
  console.log(`moved existing "${SIGN_NAME}" (node ${index}) to ${coords.join(', ')}`);
}

// Check whether the sign node is already included in the active scene.
// If it is not, add its index to the scene's node list.
// This makes the sign node part of the displayed 3D scene.
if (!scene.nodes.includes(index)) scene.nodes.push(index);

// Convert the updated JavaScript object back into JSON text.
// The GLB format requires the JSON chunk length to be a multiple of 4 bytes.
const jsonBytes = Buffer.from(JSON.stringify(json), 'utf8');

// Calculate how many padding bytes are needed to make the JSON length
// divisible by 4. The padding uses spaces (0x20), as allowed by GLB.
const padding = (4 - (jsonBytes.length % 4)) % 4;

// Add the required padding bytes to the end of the JSON data.
const padded = Buffer.concat([jsonBytes, Buffer.alloc(padding, 0x20)]);

// Create a new 12-byte GLB header.
const header = Buffer.alloc(12);

// Write the GLB magic number into the first 4 bytes.
header.writeUInt32LE(GLB_MAGIC, 0);

// Write the GLB version number (2) into the next 4 bytes.
header.writeUInt32LE(2, 4);

// Calculate and write the total file length.
// This includes the GLB header (12 bytes), JSON chunk header (8 bytes),
// padded JSON data, and the unchanged remaining binary data.
header.writeUInt32LE(12 + 8 + padded.length + rest.length, 8);

// Create an 8-byte header for the JSON chunk.
const chunkHeader = Buffer.alloc(8);

// Write the padded JSON chunk length into the first 4 bytes.
chunkHeader.writeUInt32LE(padded.length, 0);

// Write the JSON chunk type into the next 4 bytes.
chunkHeader.writeUInt32LE(CHUNK_JSON, 4);

// Rebuild the GLB file by combining:
// 1. The updated GLB header.
// 2. The updated JSON chunk header.
// 3. The updated and padded JSON data.
// 4. The original remaining binary data.
//
// Write the completed GLB file back to its original file path.
writeFileSync(file, Buffer.concat([header, chunkHeader, padded, rest]));

// Display a message confirming that the file was successfully updated.
console.log(`wrote ${file}`);
