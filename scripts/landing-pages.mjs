import fs from "node:fs";
import path from "node:path";
import { loadEntries, renderNotFoundHtml, renderWordHtml, slugFor } from "../lib/landing.mjs";

export function writeLandingPages(dist) {
  const wordDir = path.join(dist, "word");
  fs.mkdirSync(wordDir, { recursive: true });
  for (const entry of loadEntries()) {
    fs.writeFileSync(path.join(wordDir, `${slugFor(entry.word)}.html`), renderWordHtml(entry));
  }
  fs.writeFileSync(path.join(dist, "404.html"), renderNotFoundHtml());
}
