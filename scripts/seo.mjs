/**
 * Emits robots.txt, sitemap.xml and the static brand images into dist/.
 *
 * Dependency-free on purpose (no sharp here) so `npm run build` stays safe on
 * Vercel. The PNG/SVG assets are committed to the repo; this only copies them.
 * To add a page: append it to PAGES below and it shows up in the sitemap.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const SITE = "https://devildictionary.com";

// url -> { file: source file used for lastmod, priority, changefreq }
const PAGES = [
  { url: "/", file: "index.html", priority: "1.0", changefreq: "weekly" },
  { url: "/print-play", file: "print-play.html", priority: "0.7", changefreq: "monthly" },
  { url: "/community", file: "community.html", priority: "0.5", changefreq: "weekly" },
  { url: "/support", file: "support.html", priority: "0.6", changefreq: "monthly" },
  { url: "/pricing", file: "pricing.html", priority: "0.5", changefreq: "monthly" },
  { url: "/community-policy", file: "community-policy.html", priority: "0.3", changefreq: "yearly" },
  { url: "/privacy", file: "privacy.html", priority: "0.3", changefreq: "yearly" },
  { url: "/terms", file: "terms.html", priority: "0.3", changefreq: "yearly" },
  { url: "/refund", file: "refund.html", priority: "0.3", changefreq: "yearly" }
];

const isoDate = (file) => {
  try {
    return fs.statSync(path.join(root, file)).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *
Allow: /
Disallow: /api/
Disallow: /editor

# The 100 definitions live in app.js; let crawlers run JS so the in-game copy
# is discoverable alongside the static pages below.
Sitemap: ${SITE}/sitemap.xml
`
);

const urls = PAGES.map(
  (p) => `  <url>
    <loc>${SITE}${p.url}</loc>
    <lastmod>${isoDate(p.file)}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
).join("\n");

fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
);

for (const [src, out] of [
  ["assets/icon.svg", "favicon.svg"],
  ["assets/favicon.png", "favicon.png"],
  ["assets/apple-touch-icon.png", "apple-touch-icon.png"],
  ["assets/og.png", "og.png"]
]) {
  fs.copyFileSync(path.join(root, src), path.join(dist, out));
}

console.log(`SEO: robots.txt, sitemap.xml (${PAGES.length} urls), favicon, og.png -> dist/`);
