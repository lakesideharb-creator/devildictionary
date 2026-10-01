import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(path.join(dist, "assets"), { recursive: true });
fs.copyFileSync(path.join(root, "assets/devil-engraving.png"), path.join(dist, "assets/devil-engraving.png"));
for (const name of ["adult", "family"]) fs.copyFileSync(path.join(root, `assets/${name}-preview.png`), path.join(dist, `assets/${name}-preview.png`));
for (const file of [
  "shop.css", "shop.js", "print-play.html", "print-play.css", "community.html", "community.css", "community.js", "editor.html", "editor.js", "community-policy.html",
  "index.html",
  "styles.css",
  "app.js",
  "legal.css",
  "privacy.html",
  "refund.html",
  "pricing.html",
  "terms.html",
  "support.html"
]) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}
fs.cpSync(path.join(root, "downloads"), path.join(dist, "downloads"), { recursive: true });
await import("./seo.mjs");
console.log("Built static site in dist/");

// Create only missing community tables in the configured deployment database.
if (process.env.VERCEL) await import("./community-migrate.mjs");
