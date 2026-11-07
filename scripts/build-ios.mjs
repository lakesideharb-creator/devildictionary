// Builds the iOS web bundle from dist/: the game only. Website pages, shop and
// analytics scripts, and social cards stay out of the app binary.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const out = path.resolve(root, process.argv[2] || "dist-ios");

const files = [
  "app.js",
  "daily-puzzle.js",
  "styles.css",
  "halloween-intro.css",
  "halloween-intro.js",
  "assets/devil-engraving.avif",
  "assets/devil-engraving.webp",
  "assets/devil-engraving.png",
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "assets"), { recursive: true });
for (const file of files) fs.copyFileSync(path.join(dist, file), path.join(out, file));

const html = fs.readFileSync(path.join(dist, "index.html"), "utf8")
  .replace(/\s*<link rel="stylesheet" href="\/shop\.css" \/>/, "")
  .replace(/\s*<script src="\/analytics\.js"(?: defer)?><\/script>/, "")
  .replace(/\s*<script src="\/shop\.js"(?: defer)?><\/script>/, "")
  .replace(/\s*<aside class="house-rail[\s\S]*?<\/aside>/g, "");
fs.writeFileSync(path.join(out, "index.html"), html);
console.log(`Built iOS bundle in ${path.relative(root, out)}/`);
