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

// An ICO file is a 6-byte header plus one 16-byte directory entry per image; modern ICO allows each image to be a PNG.
// Google renders favicons at 48px, so the file carries 16, 32 and 48 and lets each client pick.
const ico = (images: { size: number; data: Buffer }[]) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = header.length + images.length * 16;
  const entries: Buffer[] = [];

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map(image => image.data)]);
};

const outputs: [string, number][] = [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
];

for (const [file, size] of outputs) {
  writeFileSync(new URL(file, publicDir), await png(size));
}

const faviconSizes = [16, 32, 48];
const faviconImages = await Promise.all(
  faviconSizes.map(async size => ({ size, data: await png(size) })),
);

writeFileSync(new URL('favicon.ico', publicDir), ico(faviconImages));
