import { Window } from "happy-dom";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "app.js"), "utf8");

function boot(storage, options = {}) {
  const window = new Window({ url: options.url || "http://127.0.0.1:4173/" });
  window.document.write(html
    .replace(/<script src="\.\/app\.js"(?: defer)?><\/script>/, ""));
  window.document.close();
  window.Element.prototype.setPointerCapture = () => {};
  window.Element.prototype.animate = () => ({ finished: Promise.resolve() });
  const audioEvents = [];
  class AudioParam {
    constructor() { this.value = 0; }
    setValueAtTime(value) { this.value = value; }
    exponentialRampToValueAtTime(value) { this.value = value; }
  }
  class AudioNode { connect() { return this; } }
  class OscillatorNode extends AudioNode {
    constructor() { super(); this.frequency = new AudioParam(); this.type = "sine"; }
    start(when) { audioEvents.push({ kind: "tone", frequency: this.frequency.value, when }); }
    stop() {}
  }
  class GainNode extends AudioNode { constructor() { super(); this.gain = new AudioParam(); } }
  class FilterNode extends AudioNode { constructor() { super(); this.frequency = new AudioParam(); this.Q = new AudioParam(); this.type = "bandpass"; } }
  class SourceNode extends AudioNode { start(when) { audioEvents.push({ kind: "noise", when }); } }
  class AudioContext {
    constructor() { this.currentTime = 0; this.sampleRate = 8000; this.state = "running"; this.destination = new AudioNode(); }
    createOscillator() { return new OscillatorNode(); }
    createGain() { return new GainNode(); }
    createBiquadFilter() { return new FilterNode(); }
    createBufferSource() { return new SourceNode(); }
    createBuffer(channels, length) { const data = new Float32Array(length); return { getChannelData: () => data }; }
    resume() { return Promise.resolve(); }
  }
  window.AudioContext = AudioContext;
  window.__audioEvents = audioEvents;
  if (storage) window.localStorage.setItem("devils-dictionary-save-v3", JSON.stringify(storage));
  if (options.native) {
    // Stand in for the Capacitor bridge the iOS shell injects, to prove the game
    // behaves identically inside the native wrapper.
    window.Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => "ios",
      registerPlugin: () => null
    };
  }
  window.eval(script);
  return window;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function stubBoardGeometry(document, { cell = 60, gap = 4, origin = 120 } = {}) {
  const board = document.getElementById("board");
  const size = Math.round(Math.sqrt(board.children.length));
  const pitch = cell + gap;
  const boardSize = size * pitch - gap;
  const rect = (left, top, width, height) => ({
    x: left, y: top, left, top, width, height,
    right: left + width, bottom: top + height,
    toJSON() { return this; }
  });
  board.getBoundingClientRect = () => rect(origin, origin, boardSize, boardSize);
  [...board.children].forEach((el, index) => {
    const col = index % size;
    const row = Math.floor(index / size);
    el.getBoundingClientRect = () => rect(origin + col * pitch, origin + row * pitch, cell, cell);
  });
  return { cell, gap, pitch, origin, size };
}

function centerOf(geom, index) {
  const col = index % geom.size;
  const row = Math.floor(index / geom.size);
  return {
    x: geom.origin + col * geom.pitch + geom.cell / 2,
    y: geom.origin + row * geom.pitch + geom.cell / 2
  };
}

function motionQuery(reduced) {
  return query => ({
    matches: reduced && String(query).includes("prefers-reduced-motion"),
    media: String(query),
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false; }
  });
}

function installCanvasProbe(window) {
  const arcs = [];
  window.HTMLCanvasElement.prototype.getContext = function () {
    const canvas = this;
    return {
      setTransform() {},
      clearRect() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      rect() {},
      ellipse() {},
      arc(x, y, r) { arcs.push({ id: canvas.id, r, x, y }); },
      fill() {},
      stroke() {},
      save() {},
      restore() {},
      clip() {},
      createRadialGradient() { return { addColorStop() {} }; },
      measureText() { return { width: 40 }; },
      fillRect() {},
      strokeRect() {},
      fillText() {},
      roundRect() {},
      drawImage() {},
      quadraticCurveTo() {},
      bezierCurveTo() {},
      set fillStyle(_value) {},
      get fillStyle() { return "#000"; },
      set strokeStyle(_value) {},
      get strokeStyle() { return "#000"; },
      set globalAlpha(_value) {},
      get globalAlpha() { return 1; },
      set lineWidth(_value) {},
      get lineWidth() { return 1; },
      set lineCap(_value) {},
      get lineCap() { return "butt"; },
      set globalCompositeOperation(_value) {},
      get globalCompositeOperation() { return "source-over"; },
      set font(_value) {},
      get font() { return "16px serif"; },
      set textAlign(_value) {},
      get textAlign() { return "start"; }
    };
  };
  return arcs;
}

function dispatchPointer(window, target, type, point, pointerType = "touch") {
  target.dispatchEvent(new window.PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType,
    button: 0,
    clientX: point.x,
    clientY: point.y
  }));
}

function selectedIndices(document) {
  return [...document.querySelectorAll(".letter.selected")].map(cell => Number(cell.dataset.cell));
}

async function swipeCurrent(window, pointerType = "touch") {
  const { document } = window;
  const geom = stubBoardGeometry(document);
  const pathIndices = window.__DEVILS_GAME__.getState().round.path;
  const board = document.getElementById("board");
  let last = centerOf(geom, pathIndices[0]);
  dispatchPointer(window, document.querySelector(`[data-cell="${pathIndices[0]}"]`), "pointerdown", last, pointerType);
  for (const index of pathIndices.slice(1)) {
    last = centerOf(geom, index);
    dispatchPointer(window, board, "pointermove", last, pointerType);
  }
  dispatchPointer(window, board, "pointerup", last, pointerType);
  const word = window.__DEVILS_GAME__.getState().round.entry.word;
  assert.equal(document.getElementById("selectionText").textContent, word, "a finished stroke spells the hidden word");
  assert.equal(document.getElementById("definitionModal").classList.contains("open"), false, "the definition waits while the word is shown");
  assert.equal(document.getElementById("wordTriumph").hidden, false, "the completed word flashes over the board");
  assert.equal(document.getElementById("wordTriumphText").textContent, word, "the flash spells the finished word");
  await sleep(1100);
  assert.equal(document.getElementById("wordTriumph").hidden, true, "the flash leaves as the definition opens");
}

const window = boot();
const { document } = window;
assert.equal(document.querySelector("h1").textContent, "The Devil’s Dictionary");
assert.equal(document.querySelector(".subtitle").textContent, "Find the word. Face the truth.");
assert.equal(document.querySelector(".devil-engraving").getAttribute("fetchpriority"), "high");
assert.equal(document.querySelector(".devil-engraving").getAttribute("width"), "240");
assert.equal(document.querySelector(".devil-engraving").getAttribute("height"), "120");
assert.equal(document.getElementById("board").getAttribute("role"), "group");
assert.equal(document.querySelector("[role=grid]"), null);
assert.equal(document.querySelector("[role=gridcell]"), null);
assert.equal(document.getElementById("coinPips").getAttribute("role"), "img");
assert.match(document.getElementById("coinPips").getAttribute("aria-label"), /0 of 5 words toward the next coin/);
assert.equal(document.querySelector(".shop-banner").hidden, true, "pay banner stays hidden until a word is finished");
assert.equal(document.querySelector(".shop-mobile").hidden, true, "mobile pay bar stays hidden until a word is finished");
assert.equal(document.querySelectorAll(".social-links").length, 3);
for (const nav of document.querySelectorAll(".social-links")) {
  assert.equal(nav.querySelectorAll("a").length, 3, "one icon for X, YouTube, and Instagram");
  assert.equal(nav.querySelectorAll("svg").length, 3);
}
assert.equal(document.querySelector('.social-links a[data-network="x"]').getAttribute("href"), "https://x.com/Lakesideobhj");
assert.equal(document.querySelector('.social-links a[data-network="x"]').getAttribute("aria-label"), "Follow on X");
assert.equal(document.querySelector('.social-links a[data-network="youtube"]').getAttribute("aria-label"), "YouTube: Devil's Dictionary");
assert.equal(document.querySelector('.social-links a[data-network="instagram"]').getAttribute("aria-label"), "Instagram @lakesideharb");
assert.equal(document.querySelector('a[href*="intent/follow"]'), null);
assert.equal(document.body.textContent.includes("Visit @Lakesideobhj"), false);
assert.equal(document.querySelectorAll(".letter").length, 25, "beginner stage renders a 5×5 board");
assert.equal(window.__DEVILS_GAME__.entries.length, 100, "expanded dictionary loads");

assert.equal(document.getElementById("soundToggle").getAttribute("aria-pressed"), "true");
document.getElementById("soundToggle").click();
assert.equal(window.__DEVILS_GAME__.getState().sound, false, "sound preference can be muted and saved");
const mutedEventCount = window.__audioEvents.length;
document.getElementById("hintButton").click();
assert.equal(window.__audioEvents.length, mutedEventCount, "muted mode suppresses synthesized sound");
document.getElementById("soundToggle").click();
assert.equal(window.__DEVILS_GAME__.getState().sound, true);

document.getElementById("hintButton").click();
assert.ok(document.querySelector(".path-line.hint"), "hint draws a dashed SVG path");
assert.ok(document.querySelectorAll(".hint-node").length >= 3, "hint identifies path cells");
assert.ok(window.__audioEvents.some(event => event.kind === "noise"), "hint produces a paper-scratch sound");

const firstLetter = document.querySelector('[data-cell="0"]');
const secondLetter = document.querySelector('[data-cell="1"]');
const skippedLetter = document.querySelector('[data-cell="2"]');
firstLetter.click();
skippedLetter.click();
assert.equal(document.getElementById("selectionText").textContent, firstLetter.textContent, "keyboard activation ignores a letter that is not adjacent");
secondLetter.click();
assert.equal(document.getElementById("selectionText").textContent, firstLetter.textContent + secondLetter.textContent, "keyboard activation still links adjacent letters");
assert.equal(document.getElementById("definitionModal").classList.contains("open"), false, "a partial keyboard path does not submit the word");

for (let solved = 1; solved <= 5; solved += 1) {
  await swipeCurrent(window);
  assert.ok(document.getElementById("definitionModal").classList.contains("open"), "definition popup opens after a valid swipe");
  assert.ok(document.getElementById("definitionText").textContent.length > 20, "counter-intuitive definition is shown");
  assert.equal(document.getElementById("completedCount").textContent, String(solved), "cumulative progress increments");
  if (solved === 1) {
    assert.equal(document.querySelector(".shell").inert, true, "open definition keeps keyboard focus out of the background");
    const copied = [];
    const opened = [];
    Object.defineProperty(window.navigator, "clipboard", { configurable: true, value: { writeText: async text => copied.push(text) } });
    window.open = url => { opened.push(url); return { closed: false }; };
    document.getElementById("shareWordButton").click();
    const intent = new URL(opened[0]);
    assert.equal(intent.origin + intent.pathname, "https://x.com/intent/post");
    assert.equal(intent.searchParams.get("via"), "Lakesideobhj");
    assert.equal(intent.searchParams.get("utm_source"), "x");
    assert.equal(intent.searchParams.get("utm_medium"), "share");
    assert.equal(intent.searchParams.get("utm_campaign"), "game");
    const shared = intent.searchParams.get("text");
    assert.ok(shared.includes(window.__DEVILS_GAME__.getState().round.entry.en), "X intent includes the unlocked definition");
    assert.ok(shared.includes("utm_source=x&utm_medium=share&utm_campaign=game"), "shared link carries the game campaign");
    assert.ok(shared.includes("Find the word. Face the truth."));
    document.getElementById("copyWordButton").click();
    await sleep(0);
    assert.ok(copied[0].includes(window.__DEVILS_GAME__.getState().round.entry.en), "copy keeps the definition as a fallback");
    assert.ok(copied[0].includes("https://devildictionary.com/?utm_source=x&utm_medium=share&utm_campaign=game"));
    assert.equal(document.querySelector(".shop-banner").hidden, false, "pay banner can appear after the first word");
    document.getElementById("nextButton").focus();
    document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
    assert.equal(document.activeElement.id, "saveCardButton", "Tab wraps to the first modal action");
  }
  if (solved < 5) {
    document.getElementById("nextButton").click();
    assert.equal(document.querySelector(".shell").inert, false, "next word restores background interaction");
    await sleep(280);
  }
}
await sleep(690);
assert.equal(document.getElementById("coinCount").textContent, "1", "fifth unique word earns one coin");
assert.ok(document.getElementById("coinCelebration").classList.contains("show"), "coin celebration animation triggers");
assert.ok(window.__audioEvents.filter(event => event.kind === "tone").length > 20, "swipes, reveals and the coin sequence synthesize tonal feedback");

const tierOne = window.__DEVILS_GAME__.entries.filter(entry => entry.tier === 1).map(entry => entry.word);
const first24 = tierOne.slice(0, 24);
const unlock = boot({ completed: first24, order: first24.slice(-5), current: null, hints: 0, rounds: 24 });
await swipeCurrent(unlock);
assert.equal(unlock.document.getElementById("completedCount").textContent, "25");
assert.match(unlock.document.getElementById("nextButton").textContent, /ENTER STAGE II/);
unlock.document.getElementById("nextButton").click();
assert.ok(unlock.document.getElementById("stageCurtain").classList.contains("show"), "stage two gets a dramatic unlock curtain");
await sleep(2400);
assert.equal(unlock.document.querySelectorAll(".letter").length, 36, "stage two upgrades to a 6×6 board");
assert.ok(unlock.document.querySelector("#targetWord .mask"), "stage two conceals the inner letters");

await swipeCurrent(unlock);
assert.ok(unlock.document.getElementById("definitionModal").classList.contains("judging"));
assert.equal(unlock.document.querySelectorAll(".definition-choice").length, 3, "judgment presents three definitions");
assert.equal(unlock.document.getElementById("definitionReveal").hidden, true, "share actions remain hidden until the verdict is resolved");
assert.equal(unlock.document.getElementById("completedCount").textContent, "25", "word is not collected before a verdict");
const wrongChoice = unlock.document.querySelector('.definition-choice[data-correct="false"]');
wrongChoice.click();
assert.ok(wrongChoice.classList.contains("rejected"), "a comfortable definition is rejected with feedback");
assert.equal(unlock.document.getElementById("completedCount").textContent, "25", "wrong verdict cannot advance progress");
assert.match(unlock.document.getElementById("judgmentFeedback").textContent, /DICTIONARY RECORD/);
unlock.document.querySelector('.definition-choice[data-correct="true"]').click();
assert.equal(unlock.document.getElementById("completedCount").textContent, "26", "correct anti-common-sense verdict collects the entry");
assert.equal(unlock.document.getElementById("definitionReveal").hidden, false);
assert.match(unlock.document.getElementById("readerNote").textContent, /READER'S NOTE/);

const throughThree = window.__DEVILS_GAME__.entries.filter(entry => entry.tier <= 3).map(entry => entry.word);
const first74 = throughThree.slice(0, 74);
const stageFour = boot({ completed: first74, order: first74.slice(-5), current: null, hints: 0, rounds: 74 });
const stageFourDocument = stageFour.document;
assert.equal(stageFourDocument.getElementById("completedCount").textContent, "74");
assert.equal(stageFourDocument.getElementById("coinCount").textContent, "14", "74 saved words reliably reconcile to fourteen coins");
assert.match(stageFourDocument.getElementById("stageName").textContent, /STAGE III/, "third stage is active before the boundary");
await swipeCurrent(stageFour);
assert.equal(stageFourDocument.getElementById("completedCount").textContent, "75", "third-stage words are not judged");
assert.match(stageFourDocument.getElementById("nextButton").textContent, /ENTER STAGE IV/);
stageFourDocument.getElementById("nextButton").click();
assert.ok(stageFourDocument.getElementById("stageCurtain").classList.contains("show"), "stage four gets its own unlock curtain");
assert.equal(stageFourDocument.getElementById("curtainName").textContent, "STAGE IV · THE AUTHOR");
await sleep(2400);
assert.equal(stageFourDocument.querySelectorAll(".letter").length, 64, "stage four upgrades to an 8×8 board");

await swipeCurrent(stageFour);
assert.ok(stageFourDocument.getElementById("definitionModal").classList.contains("judging"), "stage four also judges definitions");
assert.equal(stageFourDocument.querySelectorAll(".definition-choice").length, 3, "stage four presents three definitions");
stageFourDocument.querySelector('.definition-choice[data-correct="false"]').click();
assert.equal(stageFourDocument.getElementById("completedCount").textContent, "75", "wrong verdict cannot advance progress");
stageFourDocument.querySelector('.definition-choice[data-correct="true"]').click();
assert.equal(stageFourDocument.getElementById("completedCount").textContent, "76", "correct verdict collects the stage-four entry");
await sleep(690);
assert.equal(stageFourDocument.getElementById("coinCount").textContent, "15", "75→76 boundary earns the fifteenth coin");
assert.ok(stageFourDocument.getElementById("coinCelebration").classList.contains("show"));

// ---------- nothing is gated, on the web or inside the native shell ----------
const everyWord = window.__DEVILS_GAME__.entries.map(entry => entry.word);
const partway = everyWord.slice(0, 30);
const gatedSave = { completed: partway, order: partway.slice(-5), current: null, hints: 0, rounds: 30 };

const webGated = boot(gatedSave);
assert.equal(webGated.__DEVILS_GAME__.isNative, false);
assert.equal(webGated.document.getElementById("lockPanel"), null, "no vault panel exists at all");
assert.ok(webGated.document.querySelectorAll(".letter").length >= 36, "the web build keeps dealing words");

// Inside the iOS shell the same save is treated exactly the same way.
const gated = boot(gatedSave, { native: true });
assert.equal(gated.__DEVILS_GAME__.isNative, true);
assert.equal(gated.document.getElementById("lockPanel"), null, "the native shell has no paywall either");
assert.ok(gated.document.querySelectorAll(".letter").length >= 36, "the native shell deals past 30 entries");

// Reading every entry replays instead of dead-ending.
const finished = boot({ completed: everyWord, order: everyWord.slice(-5), current: null, hints: 0, rounds: 100 }, { native: true });
assert.equal(finished.document.querySelectorAll(".letter").length, 64, "a finished dictionary deals an 8×8 replay");
assert.equal(finished.document.getElementById("completedCount").textContent, "100");

const deep = boot(null, { url: "http://127.0.0.1:4173/?word=HOPE" });
assert.equal(deep.__DEVILS_GAME__.getState().round.entry.word, "HOPE", "daily and word pages can open a specific entry");

// Phone-sized stage II (entry 26): 6×6 tiles, 3px gutter. A graze into the
// next tile used to link it; the finger now has to travel down that letter's lane.
const stageTwoWords = window.__DEVILS_GAME__.entries.filter(entry => entry.tier === 1).map(entry => entry.word);
const dense = boot({
  completed: stageTwoWords,
  order: stageTwoWords.slice(-5),
  current: null,
  hints: 0,
  rounds: 25,
  sound: false,
  judgment: { comfort: 0, order: 0, correct: 0, firstTry: 0 }
});
assert.equal(dense.document.querySelectorAll(".letter").length, 36, "entry 26 is the dense 6×6 board");
assert.ok(dense.document.getElementById("board").classList.contains("is-dense"));
exerciseDenseFeel(dense, { cell: 48, gap: 3, origin: 80 });
// Desktop board is 380px, or 300px when the laptop window is shorter than 850px.
// 6×6 tiles land near 58px; the short-laptop 6×6 is near 45px. 8×8 on that
// laptop is near 33px. The pointer aims at the glyph, not the centerline.
exerciseMouseFeel(dense, { cell: 58, gap: 4, origin: 120 });
exerciseMouseFeel(dense, { cell: 45, gap: 4, origin: 80 });
exerciseTouchStillLanes(dense, { cell: 58, gap: 4, origin: 120 });

const eightWords = window.__DEVILS_GAME__.entries.filter(entry => entry.tier <= 3).map(entry => entry.word);
const eight = boot({
  completed: eightWords,
  order: eightWords.slice(-5),
  current: null,
  hints: 0,
  rounds: 75,
  sound: false,
  judgment: { comfort: 0, order: 0, correct: 0, firstTry: 0 }
});
assert.equal(eight.document.querySelectorAll(".letter").length, 64, "the densest phone grid is 8×8");
exerciseDenseFeel(eight, { cell: 36, gap: 3, origin: 40 });
exerciseMouseFeel(eight, { cell: 33, gap: 4, origin: 40 });

function exerciseDenseFeel(window, geomOptions) {
  const { document } = window;
  const geom = stubBoardGeometry(document, geomOptions);
  const board = document.getElementById("board");
  const start = centerOf(geom, 0);
  const aimed = centerOf(geom, 1);
  const belowEdge = { x: start.x, y: geom.origin + geom.pitch + 2 };
  const diagonal = geom.size + 1;
  const diagonalCorner = { x: geom.origin + geom.pitch + 2, y: geom.origin + geom.pitch + 2 };
  const preview = { x: start.x + geom.pitch * 0.5, y: start.y };
  const wobble = { x: start.x + geom.pitch * 0.82, y: start.y + 10 };
  const grazeBack = { x: geom.origin + geom.cell - 1, y: start.y };

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start);
  assert.equal(board.classList.contains("is-pointer"), false, "a finger drag does not take the mouse aim path");
  dispatchPointer(window, board, "pointermove", belowEdge);
  assert.deepEqual(selectedIndices(document), [0], "entering the near edge of the tile below does not link it");
  dispatchPointer(window, board, "pointermove", diagonalCorner);
  assert.equal(document.querySelector(`[data-cell="${diagonal}"]`).classList.contains("selected"), false, "a diagonal corner graze does not link that letter");
  assert.deepEqual(selectedIndices(document), [0], "corner clips leave the path on the letter where the finger started");

  dispatchPointer(window, board, "pointermove", preview);
  assert.deepEqual(selectedIndices(document), [0], "halfway down the lane does not lock the neighbor yet");
  assert.ok(document.querySelector('[data-cell="1"]').classList.contains("candidate"), "the aimed letter previews before it locks");
  assert.ok(document.querySelector(".path-line"), "an ink trail is drawn while the finger is still between letters");
  assert.ok(document.querySelector(".path-finger"), "the trail ends on the fingertip");
  assert.ok(document.querySelector('[data-cell="0"]').classList.contains("is-head"), "the current letter presses in as the head of the path");

  dispatchPointer(window, board, "pointermove", wobble);
  assert.deepEqual(selectedIndices(document), [0, 1], "a small sideways wobble still locks the letter the finger is aiming at");
  assert.equal(document.querySelector('[data-cell="1"]').classList.contains("candidate"), false, "a locked letter is no longer a preview");
  assert.ok(document.querySelector('[data-cell="1"]').classList.contains("is-head"));
  assert.ok(document.querySelector('[data-cell="1"]').classList.contains("selected"));

  dispatchPointer(window, board, "pointermove", grazeBack);
  assert.deepEqual(selectedIndices(document), [0, 1], "brushing the previous tile does not erase the path");
  dispatchPointer(window, board, "pointermove", start);
  assert.deepEqual(selectedIndices(document), [0], "returning to the previous letter undoes the link");

  dispatchPointer(window, board, "pointermove", centerOf(geom, 2));
  assert.deepEqual(selectedIndices(document), [0, 1, 2], "a fast flick still collects every letter the finger passes through");
  dispatchPointer(window, board, "pointercancel", centerOf(geom, 2));
  assert.deepEqual(selectedIndices(document), [], "cancelling the stroke clears the path");
  assert.equal(document.getElementById("definitionModal").classList.contains("open"), false, "a cancelled stroke does not submit");
}

function pathPoints(document) {
  const line = document.querySelector(".path-line");
  return (line?.getAttribute("points") || "").trim().split(/\s+/).filter(Boolean).map(pair => {
    const [x, y] = pair.split(",").map(Number);
    return { x, y };
  });
}

function hasPoint(points, x, y, slack = 1.6) {
  return points.some(point => Math.hypot(point.x - x, point.y - y) <= slack);
}

function exerciseMouseFeel(window, geomOptions) {
  const { document } = window;
  const geom = stubBoardGeometry(document, geomOptions);
  const board = document.getElementById("board");
  const note = text => `${text} (${geom.cell}px tile, pitch ${geom.pitch})`;
  const start = centerOf(geom, 0);
  const east = centerOf(geom, 1);
  const early = { x: start.x + geom.pitch * 0.24, y: start.y };
  const downish = { x: start.x + geom.pitch * 0.12, y: start.y + geom.pitch * 0.46 };
  const back = { x: start.x + 4, y: start.y };
  const entered = { x: east.x - geom.cell / 2 + 2, y: east.y };
  const offCenter = { x: east.x - 4, y: east.y + Math.min(16, geom.cell / 2 - 1) };
  const diagonal = geom.size + 1;
  const diagonalCenter = centerOf(geom, diagonal);
  const corner = { x: diagonalCenter.x - geom.cell / 2 + 2, y: diagonalCenter.y - geom.cell / 2 + 2 };
  const gap = { x: (start.x + east.x) / 2, y: start.y };
  const onto = { x: start.x + geom.pitch * 0.42, y: start.y };

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  assert.ok(board.classList.contains("is-pointer"), note("a mouse drag is marked so the pointer lane can stay snappy"));
  dispatchPointer(window, board, "pointermove", early, "mouse");
  assert.deepEqual(selectedIndices(document), [0], note("the ring leads the cursor and does not lock early"));
  assert.ok(document.querySelector('[data-cell="1"]').classList.contains("candidate"), note("the aimed letter rings before the cursor reaches it"));
  dispatchPointer(window, board, "pointermove", downish, "mouse");
  assert.equal(document.querySelector('[data-cell="1"]').classList.contains("candidate"), false, note("the ring leaves a letter when the cursor turns away"));
  assert.ok(document.querySelector(`[data-cell="${geom.size}"]`).classList.contains("candidate"), note("the ring follows the lane the cursor is actually in"));
  dispatchPointer(window, board, "pointermove", back, "mouse");
  assert.equal(document.querySelector(".letter.candidate"), null, note("backing toward the current letter clears the ring"));
  dispatchPointer(window, board, "pointercancel", back, "mouse");

  const elbow = { x: start.x + geom.pitch * 0.36, y: start.y };
  const tip = { x: elbow.x, y: start.y + geom.pitch * 0.22 };
  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(window, board, "pointermove", elbow, "mouse");
  dispatchPointer(window, board, "pointermove", tip, "mouse");
  const ink = pathPoints(document);
  assert.ok(hasPoint(ink, elbow.x - geom.origin, elbow.y - geom.origin), note("the ink keeps the corner the cursor actually turned"));
  assert.ok(hasPoint(ink, tip.x - geom.origin, tip.y - geom.origin), note("the ink ends on the cursor"));
  const finger = document.querySelector(".path-finger");
  assert.ok(finger, note("the trail still has a tip"));
  assert.ok(Math.abs(Number(finger.getAttribute("cx")) - (tip.x - geom.origin)) < 0.2, note("the tip sits on the cursor, not a chord behind it"));
  assert.ok(Math.abs(Number(finger.getAttribute("cy")) - (tip.y - geom.origin)) < 0.2, note("the tip tracks the cursor's vertical position"));
  dispatchPointer(window, board, "pointercancel", tip, "mouse");

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(window, board, "pointermove", entered, "mouse");
  assert.deepEqual(selectedIndices(document), [0, 1], note("the aimed letter locks as soon as the cursor is on it"));
  assert.equal(document.querySelector('[data-cell="1"]').classList.contains("candidate"), false, note("a locked letter drops the preview ring"));
  dispatchPointer(window, board, "pointercancel", entered, "mouse");

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(window, board, "pointermove", offCenter, "mouse");
  assert.deepEqual(selectedIndices(document), [0, 1], note("a cursor on the glyph but off the centerline still locks that letter"));
  dispatchPointer(window, board, "pointercancel", offCenter, "mouse");

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(window, board, "pointermove", corner, "mouse");
  assert.deepEqual(selectedIndices(document), [0], note("a diagonal corner graze still does not link"));
  assert.equal(document.querySelector(`[data-cell="${diagonal}"]`).classList.contains("candidate"), false, note("a corner graze does not leave a sticky ring"));
  dispatchPointer(window, board, "pointercancel", corner, "mouse");

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(window, board, "pointermove", east, "mouse");
  assert.deepEqual(selectedIndices(document), [0, 1], note("the cursor can still lock by reaching the letter's center"));
  dispatchPointer(window, board, "pointermove", gap, "mouse");
  assert.deepEqual(selectedIndices(document), [0, 1], note("the gap between letters does not undo"));
  dispatchPointer(window, board, "pointermove", onto, "mouse");
  assert.deepEqual(selectedIndices(document), [0], note("putting the cursor back on the previous letter undoes one step"));
  dispatchPointer(window, board, "pointercancel", onto, "mouse");

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(window, board, "pointermove", centerOf(geom, 2), "mouse");
  assert.deepEqual(selectedIndices(document), [0, 1, 2], note("a fast mouse flick still collects every letter it crosses"));
  dispatchPointer(window, board, "pointercancel", centerOf(geom, 2), "mouse");

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(window, board, "pointermove", diagonalCenter, "mouse");
  assert.deepEqual(selectedIndices(document).slice().sort((a, b) => a - b), [0, diagonal], note("a diagonal flick still locks the letter the cursor crosses"));
  dispatchPointer(window, board, "pointercancel", diagonalCenter, "mouse");

  const home = geom.size + Math.floor(geom.size / 2);
  const homePoint = centerOf(geom, home);
  for (const [row, col] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
    const index = home + row * geom.size + col;
    dispatchPointer(window, document.querySelector(`[data-cell="${home}"]`), "pointerdown", homePoint, "mouse");
    dispatchPointer(window, board, "pointermove", centerOf(geom, index), "mouse");
    assert.deepEqual(selectedIndices(document).slice().sort((a, b) => a - b), [home, index].sort((a, b) => a - b), note(`mouse locks direction ${row},${col}`));
    dispatchPointer(window, board, "pointercancel", centerOf(geom, index), "mouse");
  }

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(window, board, "pointermove", east, "mouse");
  dispatchPointer(window, board, "pointerup", east, "mouse");
  assert.equal(document.getElementById("definitionModal").classList.contains("open"), false, note("releasing a partial word does not submit"));
  assert.deepEqual(selectedIndices(document), [0, 1], note("release keeps the path until the board clears it"));
  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(window, board, "pointercancel", start, "mouse");
  assert.equal(board.classList.contains("is-pointer"), false, note("the pointer lane ends when the drag ends"));
}

// Same desktop tile size, still a finger: the phone lane must not inherit the mouse aim box.
function exerciseTouchStillLanes(window, geomOptions) {
  const { document } = window;
  const geom = stubBoardGeometry(document, geomOptions);
  const board = document.getElementById("board");
  const start = centerOf(geom, 0);
  const east = centerOf(geom, 1);
  const entered = { x: east.x - geom.cell / 2 + 2, y: east.y };
  const offCenter = { x: east.x - 4, y: east.y + Math.min(16, geom.cell / 2 - 1) };
  const onto = { x: start.x + geom.pitch * 0.42, y: start.y };
  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "touch");
  dispatchPointer(window, board, "pointermove", entered, "touch");
  assert.deepEqual(selectedIndices(document), [0], "a finger just inside the next tile still has not locked it");
  dispatchPointer(window, board, "pointercancel", entered, "touch");

  // Approach the off-center spot from the side so the stroke never crosses the centerline lane.
  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "touch");
  dispatchPointer(window, board, "pointermove", { x: start.x, y: offCenter.y }, "touch");
  dispatchPointer(window, board, "pointermove", offCenter, "touch");
  assert.deepEqual(selectedIndices(document), [0], "a finger off the centerline still misses on a desktop-sized dense tile");
  dispatchPointer(window, board, "pointercancel", offCenter, "touch");

  dispatchPointer(window, document.querySelector('[data-cell="0"]'), "pointerdown", start, "touch");
  dispatchPointer(window, board, "pointermove", { x: start.x + geom.pitch * 0.82, y: start.y + 8 }, "touch");
  assert.deepEqual(selectedIndices(document), [0, 1], "the finger still locks once it has traveled the lane");
  dispatchPointer(window, board, "pointermove", onto, "touch");
  assert.deepEqual(selectedIndices(document), [0, 1], "a finger that only reaches the near side of the previous tile does not undo");
  dispatchPointer(window, board, "pointercancel", onto, "touch");
  void board;
}

const stageOne = boot({ sound: false });
assert.equal(stageOne.document.querySelectorAll(".letter").length, 25, "stage I stays a 5×5");
{
  const geom = stubBoardGeometry(stageOne.document, { cell: 58, gap: 4, origin: 90 });
  const board = stageOne.document.getElementById("board");
  const start = centerOf(geom, 0);
  const east = centerOf(geom, 1);
  dispatchPointer(stageOne, stageOne.document.querySelector('[data-cell="0"]'), "pointerdown", start, "mouse");
  dispatchPointer(stageOne, board, "pointermove", { x: east.x - geom.cell / 2 + 2, y: east.y }, "mouse");
  assert.deepEqual(selectedIndices(stageOne.document), [0], "stage I mouse still uses the lane and does not lock on tile entry");
  dispatchPointer(stageOne, board, "pointermove", { x: start.x + geom.pitch * 0.72, y: start.y }, "mouse");
  assert.deepEqual(selectedIndices(stageOne.document), [0, 1], "stage I mouse still locks after the lane commit");
  dispatchPointer(stageOne, board, "pointercancel", start, "mouse");
}

await swipeCurrent(dense, "mouse");
assert.ok(dense.document.getElementById("definitionModal").classList.contains("open"), "a mouse stroke of the real word still submits on release");

const vivid = boot({ sound: false });
vivid.matchMedia = motionQuery(false);
{
  const arcs = installCanvasProbe(vivid);
  const { document } = vivid;
  const geom = stubBoardGeometry(document);
  const pathIndices = vivid.__DEVILS_GAME__.getState().round.path;
  const board = document.getElementById("board");
  const word = vivid.__DEVILS_GAME__.getState().round.entry.word;
  document.querySelector(`[data-cell="${pathIndices[0]}"]`).click();
  document.querySelector(`[data-cell="${pathIndices[1]}"]`).click();
  assert.equal(arcs.filter(arc => arc.id === "emberLayer").length, 0, "sparks stay off until the finger is dragging");
  assert.equal(arcs.filter(arc => arc.id === "triumphBurst").length, 0, "fireworks wait for the solved word");
  let last = centerOf(geom, pathIndices[0]);
  dispatchPointer(vivid, document.querySelector(`[data-cell="${pathIndices[0]}"]`), "pointerdown", last, "touch");
  const trail = arcs.filter(arc => arc.id === "emberLayer");
  assert.ok(trail.length >= 10, "dragging sprays a readable handful of trail sparks");
  assert.ok(trail.some(arc => arc.r >= 16), "trail sparks draw a glow large enough to see beside the path");
  for (const index of pathIndices.slice(1)) {
    last = centerOf(geom, index);
    dispatchPointer(vivid, board, "pointermove", last, "touch");
  }
  dispatchPointer(vivid, board, "pointerup", last, "touch");
  assert.equal(document.getElementById("wordTriumph").hidden, false, "the solved word still flashes");
  assert.equal(document.getElementById("wordTriumphText").textContent, word, "the flash spells the solved word");
  const burst = arcs.filter(arc => arc.id === "triumphBurst");
  assert.ok(burst.length >= 20, "a solved word bursts fireworks around the flash");
  assert.ok(burst.some(arc => arc.r >= 16), "triumph fireworks are large enough to read around the word");
  await sleep(1100);
  assert.equal(document.getElementById("wordTriumph").hidden, true, "fireworks leave with the flash");
}

const calm = boot({ sound: false });
calm.matchMedia = motionQuery(true);
{
  const arcs = installCanvasProbe(calm);
  const { document } = calm;
  const geom = stubBoardGeometry(document);
  const pathIndices = calm.__DEVILS_GAME__.getState().round.path;
  const board = document.getElementById("board");
  let last = centerOf(geom, pathIndices[0]);
  dispatchPointer(calm, document.querySelector(`[data-cell="${pathIndices[0]}"]`), "pointerdown", last, "touch");
  for (const index of pathIndices.slice(1)) {
    last = centerOf(geom, index);
    dispatchPointer(calm, board, "pointermove", last, "touch");
  }
  dispatchPointer(calm, board, "pointerup", last, "touch");
  assert.equal(document.getElementById("wordTriumph").hidden, false, "reduced motion still shows the finished word");
  assert.equal(document.getElementById("emberLayer").getAttribute("aria-hidden"), "true");
  assert.equal(document.getElementById("triumphBurst").getAttribute("aria-hidden"), "true");
  await sleep(400);
  assert.equal(arcs.filter(arc => arc.id === "emberLayer").length, 0, "reduced motion draws no trail sparks");
  assert.equal(arcs.filter(arc => arc.id === "triumphBurst").length, 0, "reduced motion draws no triumph fireworks");
  assert.ok(document.getElementById("definitionModal").classList.contains("open"), "reduced motion opens the definition without the long hold");
  assert.equal(document.getElementById("wordTriumph").hidden, true, "reduced motion clears the flash as the definition opens");
}

deep.close();
window.close();
unlock.close();
stageFour.close();
webGated.close();
gated.close();
finished.close();
dense.close();
eight.close();
stageOne.close();
vivid.close();
calm.close();
console.log("DOM E2E OK: stage II and IV unlocks, swipe, hint, three-way judgment, reader note, progress, coin boundaries, dense-grid touch lanes, desktop mouse aim, success flash, trail sparks, triumph fireworks, reduced motion, and no paywall anywhere");
