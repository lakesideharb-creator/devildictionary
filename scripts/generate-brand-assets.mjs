/**
 * Local-only tool. Renders the static brand/SEO images with sharp.
 *
 * Not wired into `npm run build` on purpose: sharp is not in package.json,
 * and adding it there froze a Vercel deploy once when npm install failed.
 * Run this by hand on a machine that has sharp, commit the PNGs, and the
 * build script only copies files around.
 *
 *   node scripts/generate-brand-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharp = (await import("sharp")).default;

const GOLD = "#d8a63a";
const CREAM = "#f5efe4";
const DIM = "#a99e8c";
const ESPRESSO = "#17120e";

function socialCard() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="Georgia, 'Times New Roman', serif">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#2a2018"/>
      <stop offset="100%" stop-color="${ESPRESSO}"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" filter="url(#grain)" opacity="0.05"/>
  <rect x="34" y="34" width="1132" height="562" fill="none" stroke="${GOLD}" stroke-opacity="0.28" stroke-width="1.5"/>
  <path d="M1200 0 L1100 0 L1200 100 Z" fill="#241c12"/>
  <path d="M1100 0 L1200 100" fill="none" stroke="${GOLD}" stroke-opacity="0.4" stroke-width="1.5"/>

  <text x="600" y="140" text-anchor="middle" font-size="26" letter-spacing="9" fill="${GOLD}">THE DEVIL&#8217;S DICTIONARY</text>
  <path d="M470 176 H730" stroke="${GOLD}" stroke-opacity="0.3" stroke-width="1"/>

  <text x="600" y="290" text-anchor="middle" font-size="76" fill="${CREAM}">Slide out a word.</text>
  <text x="600" y="378" text-anchor="middle" font-size="76" fill="${CREAM}">Watch it define you back.</text>

  <text x="600" y="452" text-anchor="middle" font-size="27" font-style="italic" fill="${GOLD}" fill-opacity="0.85">100 cynical definitions, four stages, one judgment.</text>

  <path d="M470 508 H730" stroke="${GOLD}" stroke-opacity="0.24" stroke-width="1"/>
  <text x="600" y="552" text-anchor="middle" font-size="24" letter-spacing="4" fill="${DIM}">devildictionary.com</text>

  <g transform="translate(96 470) scale(1.3)" fill="none" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="1.6" stroke-linecap="round">
    <path d="M20 6 V44"/>
    <path d="M20 16 H11 M20 16 H29"/>
    <path d="M11 16 V9 M29 16 V9"/>
    <path d="M13 22 C8 19 8 13 12 11"/>
    <path d="M27 22 C32 19 32 13 28 11"/>
    <path d="M20 30 C16 34 24 36 20 40"/>
  </g>
</svg>`;
}

async function main() {
  const svg = Buffer.from(socialCard());
  // palette + quality keeps the card around 150KB instead of ~640KB; social
  // crawlers have a size budget and nobody sees the difference on a timeline.
  await sharp(svg).png({ quality: 82, palette: true, colors: 96 }).toFile(path.join(root, "assets/og.png"));
  await sharp(path.join(root, "assets/icon.png")).resize(180, 180).png().toFile(path.join(root, "assets/apple-touch-icon.png"));
  await sharp(path.join(root, "assets/icon.png")).resize(64, 64).png().toFile(path.join(root, "assets/favicon.png"));
  for (const f of ["og.png", "apple-touch-icon.png", "favicon.png"]) {
    const m = await sharp(path.join(root, "assets", f)).metadata();
    console.log(f.padEnd(22), `${m.width}x${m.height}`, `${Math.round(fs.statSync(path.join(root, "assets", f)).size / 1024)}KB`);
  }
}

main();
