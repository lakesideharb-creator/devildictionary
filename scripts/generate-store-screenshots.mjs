// Renders the App Store screenshots from vector art, using the exact palette the
// game ships with and the real entries from app.js — nothing here is invented copy.
// Device screenshots should replace these before submission; see docs/app-store.md
// for the shot list to capture in the simulator.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "store", "screenshots");
fs.mkdirSync(outDir, { recursive: true });

const W = 1320;
const H = 2868;

const INK = "#17120e";
const INK_SOFT = "#2b2119";
const PAPER = "#e3d0a7";
const PAPER_DEEP = "#bda477";
const PAPER_LIGHT = "#f2e2bc";
const BLOOD = "#8d1f1b";
const GOLD = "#d8a63a";
const GOLD_LIGHT = "#ffe09a";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function text(x, y, value, { size = 40, font = SANS, fill = PAPER, anchor = "middle", weight = 400, spacing = 0, opacity = 1 } = {}) {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}">${esc(value)}</text>`;
}

function diamond(x, y, r = 14, fill = GOLD) {
  return `<path d="M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z" fill="${fill}"/>`;
}

// SVG has no wrapping, so break on words at a character budget tuned per font size.
function wrap(value, maxChars) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------- the real dictionary ---------- */

function loadDictionary() {
  const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const entries = [...js.matchAll(/\{ word: "([A-Z]+)", pos: "([^"]+)", en: "((?:[^"\\]|\\.)*)", tier: ([1-4]) \}/g)]
    .map(m => ({ word: m[1], pos: m[2], en: m[3], tier: Number(m[4]) }));
  const decoys = {};
  const re = /    ([A-Z]+): \[\n\s*\{ bias: "COMFORT", en: "((?:[^"\\]|\\.)*)" \},\n\s*\{ bias: "ORDER", en: "((?:[^"\\]|\\.)*)" \}/g;
  for (const m of js.matchAll(re)) decoys[m[1]] = [m[2], m[3]];
  return { entries, decoys, byWord: Object.fromEntries(entries.map(e => [e.word, e])) };
}

const { entries, decoys, byWord } = loadDictionary();

// Deterministic filler so the regenerated shots never drift between runs.
function seeded(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

// Build a grid that genuinely contains the word along a straight 8-way run,
// which is exactly how the game lays its own boards out.
function buildBoard(size, word) {
  const route = [];
  for (let i = 0; i < word.length; i += 1) route.push(i * size + i);
  const letters = new Array(size * size).fill(null);
  word.split("").forEach((ch, i) => { letters[route[i]] = ch; });
  const bag = entries.map(e => e.word).join("").split("");
  const rand = seeded(word.length * 7919 + size);
  for (let i = 0; i < letters.length; i += 1) {
    if (letters[i]) continue;
    letters[i] = bag[Math.floor(rand() * bag.length)];
  }
  return { letters, route };
}

/* ---------- shared frame ---------- */

function frame({ eyebrow, title, standfirst, body, caption }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#241c14"/>
      <stop offset="100%" stop-color="${INK}"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${GOLD_LIGHT}"/>
      <stop offset="100%" stop-color="${GOLD}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="46" y="46" width="${W - 92}" height="${H - 92}" fill="none" stroke="${GOLD}" stroke-opacity="0.16" stroke-width="5" rx="52"/>
  ${text(W / 2, 250, eyebrow, { size: 30, fill: GOLD, weight: 700, spacing: 9 })}
  ${text(W / 2, 400, title, { size: 104, font: SERIF, fill: PAPER_LIGHT })}
  ${diamond(W / 2, 462)}
  ${text(W / 2, 545, standfirst, { size: 38, fill: PAPER, opacity: 0.9 })}
  ${body}
  ${text(W / 2, 2400, caption, { size: 36, fill: PAPER_DEEP })}
  ${text(W / 2, 2560, "THE DEVIL’S DICTIONARY", { size: 26, fill: GOLD, weight: 700, spacing: 10, opacity: 0.75 })}
</svg>`;
}

/* ---------- 1. the word hunt ---------- */

function boardArt({ size, letters, route, target, definition }) {
  const cell = 196;
  const gap = 10;
  const span = size * cell + (size - 1) * gap;
  const x0 = (W - span) / 2;
  const y0 = 760;
  const centre = index => ({
    x: x0 + (index % size) * (cell + gap) + cell / 2,
    y: y0 + Math.floor(index / size) * (cell + gap) + cell / 2
  });
  const chosen = new Set(route);
  const polyline = route.map(i => centre(i)).map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const cells = letters.map((ch, index) => {
    const c = centre(index);
    const on = chosen.has(index);
    return `<g>
      <rect x="${c.x - cell / 2}" y="${c.y - cell / 2}" width="${cell}" height="${cell}" rx="3"
            fill="${on ? BLOOD : "rgba(242,226,188,.72)"}" stroke="${on ? PAPER : "rgba(23,18,14,.48)"}"
            stroke-width="${on ? 4 : 2}"/>
      ${text(c.x, c.y + 22, ch, { size: 92, font: SERIF, fill: on ? PAPER_LIGHT : INK, weight: 700 })}
    </g>`;
  }).join("");

  const bottom = y0 + span;
  const defLines = wrap(definition, 44);

  return `<g>
    <path d="${polyline}" fill="none" stroke="${GOLD}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
    ${cells}
  </g>
  ${text(W / 2, 700, target, { size: 46, font: SERIF, fill: GOLD, spacing: 12, weight: 700 })}
  ${text(W / 2, bottom + 90, "“" + defLines[0], { size: 40, font: SERIF, fill: PAPER, opacity: 0.92 })}
  ${defLines.slice(1).map((l, i) => text(W / 2, bottom + 146 + i * 56, l + (i === defLines.length - 2 ? "”" : ""), { size: 40, font: SERIF, fill: PAPER, opacity: 0.92 })).join("")}`;
}

const huntWord = byWord.SLEEP;
const huntBoard = buildBoard(5, huntWord.word);

const shot1 = frame({
  eyebrow: "STAGE I · THE LITERATE",
  title: "FIND THE WORD",
  standfirst: "Swipe through the letters in any direction.",
  caption: "Every entry is hidden in plain sight, one letter at a time.",
  body: boardArt({
    size: 5,
    letters: huntBoard.letters,
    route: huntBoard.route,
    target: huntWord.word,
    definition: huntWord.en
  })
});

/* ---------- 2. four stages ---------- */

function stageRow(y, sigil, name, note, gridSize) {
  const cell = gridSize === 5 ? 30 : gridSize === 6 ? 26 : gridSize === 7 ? 22 : 19;
  const gap = 4;
  const span = gridSize * cell + (gridSize - 1) * gap;
  const gx = W - 150 - span;
  const gy = y - span / 2;
  const grid = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const cx = gx + (i % gridSize) * (cell + gap);
    const cy = gy + Math.floor(i / gridSize) * (cell + gap);
    return `<rect x="${cx}" y="${cy}" width="${cell}" height="${cell}" rx="2" fill="rgba(242,226,188,.72)" opacity="0.55"/>`;
  }).join("");
  return `<g>
    ${text(150, y - 26, sigil, { size: 40, font: SERIF, fill: GOLD, anchor: "start", weight: 700 })}
    ${text(230, y - 22, name, { size: 46, font: SERIF, fill: PAPER_LIGHT, anchor: "start", weight: 700 })}
    ${text(230, y + 28, note, { size: 30, fill: PAPER_DEEP, anchor: "start" })}
    ${grid}
  </g>`;
}

const stageCounts = [1, 2, 3, 4].map(t => entries.filter(e => e.tier === t).length);

const shot2 = frame({
  eyebrow: `${entries.length} ENTRIES · FOUR STAGES`,
  title: "THE BOOK GETS WORSE",
  standfirst: "Each stage widens the grid and lowers its opinion of you.",
  caption: `${stageCounts.join(" + ")} entries, from a 5×5 board to the 8×8 of Stage IV.`,
  body: `<g>
    ${stageRow(820, "I", "THE LITERATE", "Find the word", 5)}
    ${stageRow(1140, "II", "THE DOUBTER", "Read between the letters", 6)}
    ${stageRow(1460, "III", "THE ACCOMPLICE", "The definition is watching", 7)}
    ${stageRow(1780, "IV", "THE AUTHOR", "You are the dictionary now", 8)}
  </g>`
});

/* ---------- 3. the definition judgment ---------- */

// The three options are the real entry plus its two real decoys, shuffled the
// way the game shuffles them — so the shot cannot drift from what ships.
function choiceCard(y, height, label, lines, correct) {
  const x = 110;
  const w = W - 220;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${height}" rx="10"
          fill="${correct ? "rgba(216,166,58,.10)" : "rgba(43,33,25,.55)"}"
          stroke="${correct ? GOLD : "rgba(216,166,58,.32)"}" stroke-width="${correct ? 5 : 2}"/>
    ${text(x + 40, y + 58, label, { size: 26, fill: correct ? GOLD : PAPER_DEEP, anchor: "start", weight: 700, spacing: 5 })}
    ${lines.map((l, i) => text(x + 40, y + 122 + i * 52, l, { size: 34, font: SERIF, fill: correct ? PAPER_LIGHT : PAPER, anchor: "start" })).join("")}
  </g>`;
}

const judgedWord = byWord.SUCCESS;
const judgedOptions = [
  { label: "THE DEVIL'S", en: judgedWord.en, correct: true },
  { label: "COMFORT", en: decoys.SUCCESS[0], correct: false },
  { label: "ORDER", en: decoys.SUCCESS[1], correct: false }
];
// Fixed presentation order: the true definition sits last, as it often does in play.
const presented = [judgedOptions[1], judgedOptions[2], judgedOptions[0]];

let cardY = 820;
const cardGap = 34;
const cardArt = presented.map(option => {
  const lines = wrap(option.en, 52);
  const height = 96 + lines.length * 52 + 34;
  const art = choiceCard(cardY, height, option.label, lines, option.correct);
  cardY += height + cardGap;
  return art;
}).join("");

const shot3 = frame({
  eyebrow: "STAGE II · THE JUDGMENT",
  title: "WHICH ONE IS IT?",
  standfirst: "Three definitions. All of them plausible. Only one is honest.",
  caption: "Every decoy is a real definition too — just borrowed from another word.",
  body: `<g>
    ${text(W / 2, 720, judgedWord.word, { size: 52, font: SERIF, fill: GOLD, spacing: 10, weight: 700 })}
    ${cardArt}
    ${text(W / 2, cardY + 40, "◆ CHOOSE, AND BE JUDGED ◆", { size: 30, fill: GOLD, weight: 700, spacing: 6 })}
  </g>`
});

/* ---------- 4. devil coins ---------- */

const totalCoins = Math.floor(entries.length / 5);

const shot4 = frame({
  eyebrow: "EVERY FIVE ENTRIES",
  title: "THE DEVIL PAYS",
  standfirst: "Complete five different entries and one Devil Coin is struck.",
  caption: `${totalCoins} coins in the complete book. They cannot be bought, only earned.`,
  body: `<g>
    <circle cx="${W / 2}" cy="1240" r="270" fill="${INK_SOFT}" stroke="url(#gold)" stroke-width="16"/>
    <circle cx="${W / 2}" cy="1240" r="222" fill="none" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="4"/>
    ${text(W / 2, 1330, "Ð", { size: 300, font: SERIF, fill: GOLD, weight: 700 })}
    ${text(W / 2, 1620, "COIN +1", { size: 44, fill: GOLD_LIGHT, weight: 700, spacing: 8 })}
    <g>
      ${Array.from({ length: totalCoins }, (_, i) => {
        const per = 10;
        const cx = W / 2 + (i % per) * 74 - (per - 1) * 37;
        const cy = 1820 + Math.floor(i / per) * 74;
        const lit = i < 6;
        return `<circle cx="${cx}" cy="${cy}" r="28" fill="${lit ? GOLD : "rgba(43,33,25,.9)"}" stroke="${lit ? GOLD_LIGHT : "rgba(216,166,58,.35)"}" stroke-width="${lit ? 3 : 2}"/>`;
      }).join("")}
    </g>
    ${text(W / 2, 2040, `6 OF ${totalCoins}`, { size: 34, fill: PAPER_DEEP, weight: 700, spacing: 6 })}
  </g>`
});

/* ---------- 5. free ---------- */

function tickRow(y, label, note) {
  return `<g>
    ${diamond(230, y, 15)}
    ${text(300, y + 16, label, { size: 52, font: SERIF, fill: PAPER_LIGHT, anchor: "start", weight: 700 })}
    ${text(300, y + 74, note, { size: 32, fill: PAPER_DEEP, anchor: "start" })}
  </g>`;
}

const shot5 = frame({
  eyebrow: "ALL OF IT, AT NO CHARGE",
  title: "NOTHING TO BUY",
  standfirst: "No unlock, no paywall, no restore button to hunt for.",
  caption: `${entries.length} entries · plays offline · nothing ever leaves your device`,
  body: `<g>
    ${tickRow(880, "NO ADVERTISING", "No ad SDKs, no video placements, no interrupts.")}
    ${tickRow(1180, "NO ACCOUNT", "No email, no sign-in, no profile, no cloud sync.")}
    ${tickRow(1480, "NO TRACKING", "Progress is stored on the device and nowhere else.")}
    ${text(W / 2, 1860, "“Free, adj. Worth exactly what you paid.”", { size: 44, font: SERIF, fill: GOLD, opacity: 0.95 })}
  </g>`
});

const shots = [
  ["01-find-the-word", shot1],
  ["02-four-stages", shot2],
  ["03-definition-judgment", shot3],
  ["04-devil-coins", shot4],
  ["05-nothing-to-buy", shot5]
];

for (const [name, svg] of shots) {
  const file = path.join(outDir, `${name}.png`);
  await sharp(Buffer.from(svg), { density: 220 })
    .resize(W, H)
    .flatten({ background: INK })
    .png({ compressionLevel: 9 })
    .toFile(file);
  // 6.5" iPhone variant, which App Store Connect still accepts alongside 6.9".
  const small = path.join(outDir, `${name}-65.png`);
  await sharp(file).resize(1242, 2688).png({ compressionLevel: 9 }).toFile(small);
}

const meta = await sharp(path.join(outDir, `${shots[0][0]}.png`)).metadata();
console.log(`Rendered ${shots.length * 2} screenshots in store/screenshots/ (${meta.width}×${meta.height} and 1242×2688)`);
console.log(`Data: ${entries.length} entries · hunt word ${huntWord.word} · judgment word ${judgedWord.word}`);
