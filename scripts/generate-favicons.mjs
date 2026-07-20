import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });

const sizes = [
  { file: "public/favicon-32x32.png", size: 32 },
  { file: "public/favicon-192x192.png", size: 192 },
  { file: "public/apple-touch-icon.png", size: 180 },
];

for (const { file, size } of sizes) {
  await sharp("public/logo.png")
    .resize(size, size, { fit: "contain", background: { r: 5, g: 13, b: 31, alpha: 1 } })
    .png()
    .toFile(file);
  console.log(`✓ ${file}`);
}
