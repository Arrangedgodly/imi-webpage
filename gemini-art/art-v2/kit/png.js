/* ============================================================================
   MONKEYOS V2 - ART PASS 2 DEPENDENCY-FREE PNG ENCODER
   Pure Node.js built-in zlib & Buffer. Emits valid RGBA 8-bit PNGs.
   Includes horizontal strip stitching, nearest-neighbor scaling, and manifests.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function crc32(buf, offset = 0, length = buf.length) {
  let c = 0xffffffff;
  for (let i = offset; i < offset + length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function encodePng(width, height, rgba) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth: 8
  ihdrData[9] = 6; // color type: 6 (RGBA)
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter type 0 (None)
  const rowBytes = width * 4;
  const rawScanlines = Buffer.alloc(height * (rowBytes + 1));
  let rawPtr = 0;
  let srcPtr = 0;

  for (let y = 0; y < height; y++) {
    rawScanlines[rawPtr++] = 0; // filter type 0
    for (let x = 0; x < rowBytes; x++) {
      rawScanlines[rawPtr++] = rgba[srcPtr++];
    }
  }

  // IDAT
  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function scaleRgba(width, height, rgba, factor) {
  const outW = width * factor;
  const outH = height * factor;
  const outRgba = new Uint8Array(outW * outH * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const r = rgba[srcIdx];
      const g = rgba[srcIdx + 1];
      const b = rgba[srcIdx + 2];
      const a = rgba[srcIdx + 3];

      for (let sy = 0; sy < factor; sy++) {
        const outY = y * factor + sy;
        for (let sx = 0; sx < factor; sx++) {
          const outX = x * factor + sx;
          const dstIdx = (outY * outW + outX) * 4;
          outRgba[dstIdx] = r;
          outRgba[dstIdx + 1] = g;
          outRgba[dstIdx + 2] = b;
          outRgba[dstIdx + 3] = a;
        }
      }
    }
  }

  return { width: outW, height: outH, rgba: outRgba };
}

function stitchHorizontalStrip(frames) {
  if (!frames || frames.length === 0) throw new Error('No frames to stitch');
  const count = frames.length;
  const w = frames[0].width;
  const h = frames[0].height;
  const stripW = w * count;
  const stripH = h;
  const stripRgba = new Uint8Array(stripW * stripH * 4);

  for (let f = 0; f < count; f++) {
    const fRgba = frames[f].rgba;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const srcIdx = (y * w + x) * 4;
        const dstX = f * w + x;
        const dstIdx = (y * stripW + dstX) * 4;
        stripRgba[dstIdx] = fRgba[srcIdx];
        stripRgba[dstIdx + 1] = fRgba[srcIdx + 1];
        stripRgba[dstIdx + 2] = fRgba[srcIdx + 2];
        stripRgba[dstIdx + 3] = fRgba[srcIdx + 3];
      }
    }
  }

  return { width: stripW, height: stripH, rgba: stripRgba };
}

function exportAssetFiles(resolvedAsset, outDir) {
  const categoryDir = path.join(outDir, resolvedAsset.category || 'misc');
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  const strip = stitchHorizontalStrip(resolvedAsset.frames);
  const png1x = encodePng(strip.width, strip.height, strip.rgba);
  fs.writeFileSync(path.join(categoryDir, `${resolvedAsset.id}.png`), png1x);

  const scaled3x = scaleRgba(strip.width, strip.height, strip.rgba, 3);
  const png3x = encodePng(scaled3x.width, scaled3x.height, scaled3x.rgba);
  fs.writeFileSync(path.join(categoryDir, `${resolvedAsset.id}@3x.png`), png3x);

  const manifest = {
    id: resolvedAsset.id,
    category: resolvedAsset.category,
    size: resolvedAsset.size,
    frameCount: resolvedAsset.frames.length,
    fps: resolvedAsset.fps,
    loop: resolvedAsset.loop,
    staticFrame: resolvedAsset.staticFrame,
    sparkles: resolvedAsset.sparkles,
    notes: resolvedAsset.notes
  };
  fs.writeFileSync(path.join(categoryDir, `${resolvedAsset.id}.json`), JSON.stringify(manifest, null, 2));

  return {
    path1x: path.join(categoryDir, `${resolvedAsset.id}.png`),
    path3x: path.join(categoryDir, `${resolvedAsset.id}@3x.png`),
    pathJson: path.join(categoryDir, `${resolvedAsset.id}.json`)
  };
}

module.exports = {
  encodePng,
  scaleRgba,
  stitchHorizontalStrip,
  exportAssetFiles
};
