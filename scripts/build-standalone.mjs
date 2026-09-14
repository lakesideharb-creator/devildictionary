import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

const standalone = html
  .replace('    <link rel="canonical" href="https://devildictionary.com/" />\n', "")
  .replace(/    <script>\n      if \(location\.hostname === "www\.devildictionary\.com"\) \{[\s\S]*?    <\/script>\n/, "")
  .replace('    <link rel="stylesheet" href="./styles.css" />', `    <style>\n${css}\n    </style>`)
  .replace('    <script src="./app.js"></script>', `    <script>\n${js}\n    </script>`)
  .replace("<title>", "<!-- Standalone offline edition: just double-click to run -->\n    <title>");

const output = path.join(root, "The-Devils-Dictionary.html");
fs.writeFileSync(output, standalone);
console.log(`Created ${output}`);
