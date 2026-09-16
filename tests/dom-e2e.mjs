import { Window } from "happy-dom";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "app.js"), "utf8");

function boot(storage, options = {}) {
  const window = new Window({ url: "http://127.0.0.1:4173/" });
  window.document.write(html.replace(/<script src="\.\/app\.js"><\/script>/, ""));
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
    // Stand in for the Capacitor bridge the iOS shell injects, without any plugin
    // behind it — enough to prove the paywall gates, not to exercise StoreKit.
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

async function swipeCurrent(window) {
  const { document, PointerEvent } = window;
  const pathIndices = window.__DEVILS_GAME__.getState().round.path;
  const cells = pathIndices.map(index => document.querySelector(`[data-cell="${index}"]`));
  cells[0].dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1 }));
  for (const cell of cells.slice(1)) {
    document.elementFromPoint = () => cell;
    document.getElementById("board").dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1 }));
  }
  document.getElementById("board").dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
  await sleep(270);
}

const window = boot();
const { document } = window;
assert.equal(document.querySelector("h1").textContent, "The Devil’s Dictionary");
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

for (let solved = 1; solved <= 5; solved += 1) {
  await swipeCurrent(window);
  assert.ok(document.getElementById("definitionModal").classList.contains("open"), "definition popup opens after a valid swipe");
  assert.ok(document.getElementById("definitionText").textContent.length > 20, "counter-intuitive definition is shown");
  assert.equal(document.getElementById("completedCount").textContent, String(solved), "cumulative progress increments");
  if (solved < 5) {
    document.getElementById("nextButton").click();
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

// ---------- mobile paywall ----------
const freeWords = window.__DEVILS_GAME__.freeEntries.map(entry => entry.word);
assert.equal(freeWords.length, 30, "the mobile edition gives away 30 entries");
assert.equal(new Set(freeWords).size, 30);
assert.equal(window.__DEVILS_GAME__.freeEntries.filter(entry => entry.tier === 1).length, 25, "every stage-one entry is free");
assert.equal(window.__DEVILS_GAME__.freeEntries.filter(entry => entry.tier === 2).length, 5, "stage two is only tasted");

const gatedSave = { completed: freeWords, order: freeWords.slice(-5), current: null, hints: 0, rounds: 30, unlocked: false };

// The web edition never gates anything, even with the same exhausted save.
const webGated = boot(gatedSave);
assert.equal(webGated.__DEVILS_GAME__.isNative, false);
assert.equal(webGated.__DEVILS_GAME__.hasFullAccess(), true);
assert.equal(webGated.document.getElementById("lockPanel").hidden, true, "the web build has no paywall");
assert.ok(webGated.document.querySelectorAll(".letter").length >= 36, "the web build keeps dealing words");

// Inside the native shell the same save is locked out.
const gated = boot(gatedSave, { native: true });
const gatedDocument = gated.document;
assert.equal(gated.__DEVILS_GAME__.isNative, true);
assert.equal(gated.__DEVILS_GAME__.hasFullAccess(), false);
assert.equal(gatedDocument.getElementById("lockPanel").hidden, false, "exhausted free tier shows the vault panel");
assert.ok(gatedDocument.getElementById("gameCard").classList.contains("locked"), "the board is swapped for the vault");
assert.equal(gatedDocument.getElementById("lockHeadline").textContent, "You have read 30 of 100.");

gatedDocument.getElementById("lockUnlockButton").click();
assert.ok(gatedDocument.getElementById("paywallModal").classList.contains("open"), "the vault panel opens the paywall");
assert.equal(gatedDocument.getElementById("paywallModal").getAttribute("aria-hidden"), "false");
assert.match(gatedDocument.getElementById("paywallLede").textContent, /You have read 30 of 100 entries/);

gatedDocument.getElementById("paywallDismiss").click();
assert.equal(gatedDocument.getElementById("paywallModal").classList.contains("open"), false, "the paywall can be dismissed");
assert.equal(gatedDocument.getElementById("lockPanel").hidden, false, "dismissing returns to the vault, not to a dead board");

await gated.__DEVILS_GAME__.grantUnlock("Paid in full. The vault is open.");
assert.equal(gatedDocument.getElementById("lockPanel").hidden, true, "unlocking restores the board");
assert.equal(gatedDocument.getElementById("gameCard").classList.contains("locked"), false);
assert.equal(gated.__DEVILS_GAME__.getState().unlocked, true);
assert.ok(gatedDocument.querySelectorAll(".letter").length >= 36, "a fresh word is dealt after unlocking");

// A free player is served only free words.
const nearlyGated = boot({ completed: freeWords.slice(0, 25), order: freeWords.slice(20, 25), current: null, hints: 0, rounds: 25, unlocked: false }, { native: true });
for (let i = 0; i < 6; i += 1) {
  const word = nearlyGated.__DEVILS_GAME__.getState().round.entry.word;
  assert.ok(freeWords.includes(word), `${word} is inside the free tier`);
  nearlyGated.__DEVILS_GAME__.solveCurrent();
  if (nearlyGated.document.getElementById("definitionModal").classList.contains("judging")) {
    nearlyGated.document.querySelector('.definition-choice[data-correct="true"]').click();
  }
  if (nearlyGated.document.getElementById("completedCount").textContent === "30") break;
  nearlyGated.document.getElementById("nextButton").click();
  await sleep(280);
}
assert.equal(nearlyGated.document.getElementById("completedCount").textContent, "30");
nearlyGated.document.getElementById("nextButton").click();
await sleep(120);
assert.ok(nearlyGated.document.getElementById("paywallModal").classList.contains("open"), "the 30th word opens the paywall instead of dealing a paid one");

window.close();
unlock.close();
stageFour.close();
webGated.close();
gated.close();
nearlyGated.close();
console.log("DOM E2E OK: stage II and IV unlocks, swipe, hint, three-way judgment, reader note, progress, coin boundaries, and the mobile paywall");
