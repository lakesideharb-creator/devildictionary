import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(path.join(dist, "assets"), { recursive: true });
fs.cpSync(path.join(root, "assets/house"), path.join(dist, "assets/house"), { recursive: true });
for (const name of ["devil-engraving.png", "devil-engraving.webp", "devil-engraving.avif"]) {
  fs.copyFileSync(path.join(root, "assets", name), path.join(dist, "assets", name));
}
fs.cpSync(path.join(root, "assets/og-words"), path.join(dist, "og"), { recursive: true });
for (const name of ["adult", "family"]) fs.copyFileSync(path.join(root, `assets/${name}-preview.png`), path.join(dist, `assets/${name}-preview.png`));
for (const file of [
  "shop.css", "shop.js", "print-play.html", "print-play.css", "community.html", "community.css", "community.js", "editor.html", "editor.js", "community-policy.html",
  "index.html",
  "styles.css",
  "halloween-intro.css",
  "halloween-intro.js",
  "app.js",
  "daily-puzzle.js",
  "legal.css",
  "privacy.html",
  "refund.html",
  "pricing.html",
  "terms.html",
  "support.html",
  "faq.html",
  "landing.css",
  "analytics.js"
]) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}
fs.cpSync(path.join(root, "downloads"), path.join(dist, "downloads"), { recursive: true });
fs.cpSync(path.join(root, "promo"), path.join(dist, "promo"), { recursive: true });
const { writeLandingPages } = await import("./landing-pages.mjs");
writeLandingPages(dist);
await import("./seo.mjs");
console.log("Built static site in dist/");

// Create only missing community tables in the configured deployment database.
if (process.env.VERCEL) await import("./community-migrate.mjs");
