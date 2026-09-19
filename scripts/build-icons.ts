import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const ICON_VIEWBOX = 32;
const publicDir = new URL('../public/', import.meta.url);
const svg = readFileSync(new URL('icon.svg', publicDir));

const png = (size: number) =>
  sharp(svg, { density: (72 * size) / ICON_VIEWBOX })
    .resize(size, size)
    .png()
    .toBuffer();

// An ICO file is a 6-byte header plus one 16-byte directory entry per image; modern ICO allows the image itself to be a PNG.
const ico = (image: Buffer, size: number) => {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(image.length, 14);
  header.writeUInt32LE(header.length, 18);
  return Buffer.concat([header, image]);
};

const outputs: [string, number][] = [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
];

for (const [file, size] of outputs) {
  writeFileSync(new URL(file, publicDir), await png(size));
}

writeFileSync(new URL('favicon.ico', publicDir), ico(await png(32), 32));
