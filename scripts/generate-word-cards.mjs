/**
 * Builds 1200×630 share cards for /word/<slug> and /daily.
 * ffmpeg is a local tool; the JPEGs are committed and copied by `npm run build`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEntries, slugFor } from "../lib/landing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "assets", "og-words");
const SERIF = "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf";
const BOLD = "/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf";
const ITALIC = "/usr/share/fonts/truetype/noto/NotoSerif-Italic.ttf";

function wrap(text, maxChars) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxChars) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function definitionLayout(text) {
  for (const size of [34, 30, 26, 22, 18]) {
    const maxChars = Math.max(18, Math.floor(980 / (size * 0.52)));
    const lines = wrap(text, maxChars);
    const block = lines.length * (size + 10);
    if (block <= 230 || size === 18) return { size, lines };
  }
  return { size: 18, lines: wrap(text, 28) };
}

function write(file, text) {
  fs.writeFileSync(file, text.endsWith("\n") ? text : `${text}\n`);
}

function card(entry) {
  const slug = slugFor(entry.word);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dd-card-"));
  const files = {
    kicker: path.join(dir, "kicker.txt"),
    word: path.join(dir, "word.txt"),
    pos: path.join(dir, "pos.txt"),
    def: path.join(dir, "def.txt"),
    slogan: path.join(dir, "slogan.txt"),
    url: path.join(dir, "url.txt")
  };
  const layout = definitionLayout(entry.en);
  write(files.kicker, "THE DEVIL’S DICTIONARY");
  write(files.word, entry.word);
  write(files.pos, entry.pos);
  write(files.def, layout.lines.join("\n"));
  write(files.slogan, "Find the word. Face the truth.");
  write(files.url, `devildictionary.com/word/${slug}`);
  const titleSize = entry.word.length > 9 ? 64 : entry.word.length > 7 ? 76 : 88;
  const vf = [
    "drawbox=x=24:y=24:w=1152:h=582:color=0x782D29:t=4",
    "drawbox=x=40:y=40:w=1120:h=550:color=0x782D29:t=1",
    `drawtext=fontfile=${BOLD}:textfile=${files.kicker}:expansion=none:fontsize=22:fontcolor=0x782D29:x=(w-text_w)/2:y=72`,
    `drawtext=fontfile=${BOLD}:textfile=${files.word}:expansion=none:fontsize=${titleSize}:fontcolor=0x241C16:x=(w-text_w)/2:y=118`,
    `drawtext=fontfile=${ITALIC}:textfile=${files.pos}:expansion=none:fontsize=28:fontcolor=0x782D29:x=(w-text_w)/2:y=224`,
    `drawtext=fontfile=${SERIF}:textfile=${files.def}:expansion=none:fontsize=${layout.size}:line_spacing=8:fontcolor=0x30241C:x=(w-text_w)/2:y=286`,
    `drawtext=fontfile=${ITALIC}:textfile=${files.slogan}:expansion=none:fontsize=26:fontcolor=0x782D29:x=(w-text_w)/2:y=548`,
    `drawtext=fontfile=${SERIF}:textfile=${files.url}:expansion=none:fontsize=20:fontcolor=0x782D29:x=(w-text_w)/2:y=586`
  ].join(",");
  const destination = path.join(outDir, `${slug}.jpg`);
  const result = spawnSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-f", "lavfi", "-i", "color=c=0xF4E7CB:s=1200x630:d=1",
    "-frames:v", "1",
    "-vf", vf,
    "-q:v", "3",
    destination
  ], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  if (result.status !== 0) {
    throw new Error(`card ${slug} failed: ${result.stderr || result.stdout}`);
  }
}

fs.mkdirSync(outDir, { recursive: true });
const entries = loadEntries();
for (const entry of entries) card(entry);
const sample = fs.readdirSync(outDir).filter(name => name.endsWith(".jpg"));
const bytes = sample.reduce((sum, name) => sum + fs.statSync(path.join(outDir, name)).size, 0);
console.log(`Wrote ${sample.length} word cards (${bytes} bytes) to assets/og-words/`);
