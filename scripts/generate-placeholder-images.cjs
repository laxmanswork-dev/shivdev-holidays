#!/usr/bin/env node
/**
 * Writes a plain solid-color placeholder PNG for each destination slug
 * passed on the command line, at public/images/destinations/<slug>.png
 * — used to scaffold a real file for a destination before its actual
 * photo is uploaded (see that folder's README). Never overwrites a
 * slug that isn't passed in, so it's safe to run for just the
 * destinations that still need a file.
 *
 * No image-library dependency: builds a valid PNG byte-for-byte by
 * hand (signature, IHDR, one zlib-deflated IDAT, IEND), using only
 * Node's built-in zlib.
 *
 * Usage: node scripts/generate-placeholder-images.cjs slug1 slug2 ...
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const WIDTH = 1200;
const HEIGHT = 900;
const RGB = [229, 239, 247]; // soft ice-blue, matches the site's own empty-state tint

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error('Usage: node scripts/generate-placeholder-images.cjs <slug> [slug...]');
  process.exit(1);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function buildPng(width, height, [r, g, b]) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: truecolor (RGB)
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);

  const rowBytes = width * 3;
  const raw = Buffer.alloc((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowBytes + 1);
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }
  const idat = chunk('IDAT', zlib.deflateSync(raw));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const outDir = path.join(__dirname, '..', 'public', 'images', 'destinations');
const png = buildPng(WIDTH, HEIGHT, RGB);

let written = 0;
for (const slug of slugs) {
  const outPath = path.join(outDir, `${slug}.png`);
  fs.writeFileSync(outPath, png);
  written++;
}

console.log(`Wrote ${written} placeholder PNG(s) (${WIDTH}x${HEIGHT}, ${(png.length / 1024).toFixed(1)} KB each) to ${outDir}`);
