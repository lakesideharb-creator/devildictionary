import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const hwCss = fs.readFileSync(path.join(root, "halloween-intro.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const dailyJs = fs.readFileSync(path.join(root, "daily-puzzle.js"), "utf8");
const hwJs = fs.readFileSync(path.join(root, "halloween-intro.js"), "utf8");
const engraving = fs.readFileSync(path.join(root, "assets/devil-engraving.png")).toString("base64");

const standalone = html
  .replace(/<p class="community-invitation">[\s\S]*?<\/p>/, "")
  .replace(/\s*<aside class="house-rail[\s\S]*?<\/aside>/g, "")
  .replace('    <link rel="canonical" href="https://devildictionary.com/" />\n', "")
  .replace(/    <script>\n      if \(!window\.Capacitor && location\.hostname === "www\.devildictionary\.com"\) \{[\s\S]*?    <\/script>\n/, "")
  .replace('./assets/devil-engraving.png', `data:image/png;base64,${engraving}`)
  .replace('    <link rel="stylesheet" href="./styles.css" />', `    <style>\n${css}\n${hwCss}\n    </style>`)
  .replace(/        <nav class="colophon-links"[\s\S]*?<\/nav>\n/, "")
  .replace(/\s*<form class="subscribe"[\s\S]*?<\/form>\n/, "\n")
  .replace(/\s*<script src="\/analytics\.js"(?: defer)?><\/script>\n/, "\n")
  .replace(/<script src="\/shop\.js" defer><\/script>/, "")
  .replace(/\s*<link rel="stylesheet" href="\/shop\.css" \/>\n?/, "\n")
  .replace(/<script src="\.\/daily-puzzle\.js"(?: defer)?><\/script>\n?/, "")
  .replace(/<script src="\.\/app\.js"(?: defer)?><\/script>/, `<script>\n${dailyJs}\n${hwJs}\n${js}\n    </script>`)
  .replace("<title>", "<!-- Standalone offline edition: just double-click to run -->\n    <title>");

const output = path.join(root, "The-Devils-Dictionary.html");
fs.writeFileSync(output, standalone);
console.log(`Created ${output}`);
