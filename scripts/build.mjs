import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const file of [
  "index.html",
  "styles.css",
  "app.js",
  "legal.css",
  "privacy.html",
  "refund.html",
  "pricing.html",
  "terms.html"
]) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}
// Ship the in-app purchase plugin's browser build so the native WebView can reach
// StoreKit without a bundler. Capacitor injects the `capacitorExports` global itself.
const purchaseSrc = path.join(root, "node_modules/@capgo/native-purchases/dist/plugin.js");
if (fs.existsSync(purchaseSrc)) {
  fs.copyFileSync(purchaseSrc, path.join(dist, "purchase.js"));
} else {
  console.log("warning: @capgo/native-purchases missing, skipping purchase.js");
}
console.log("Built static site in dist/");
