import { Window } from "happy-dom";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { entryBySlug } from "../lib/landing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const intro = fs.readFileSync(path.join(root, "halloween-intro.js"), "utf8");
const page = html.replace(/<script[\s\S]*?<\/script>/gi, "");
const destiny = entryBySlug("destiny");

function mockDate(window, y, m, d) {
  const Real = window.Date;
  function D(...args) {
    if (!new.target) return Real(...args);
    if (args.length === 0) return new Real(y, m, d, 15, 0, 0);
    return new Real(...args);
  }
  D.prototype = Real.prototype;
  Object.setPrototypeOf(D, Real);
  D.now = () => new Real(y, m, d, 15, 0, 0).getTime();
  D.parse = Real.parse;
  D.UTC = Real.UTC;
  window.Date = D;
}

function installAudio(window, mode) {
  const events = [];
  const buffers = [];
  const gains = [];
  let constructed = 0;
  window.__halloweenAudio = {
    events,
    buffers,
    gains,
    constructed: () => constructed
  };
  if (mode === "missing") {
    window.AudioContext = undefined;
    window.webkitAudioContext = undefined;
    return;
  }
  class AudioParam {
    constructor() { this.value = 0; this.attack = null; }
    setValueAtTime(value) {
      if (this.attack == null) this.attack = value;
      this.value = value;
      return this;
    }
    linearRampToValueAtTime(value) { this.value = value; return this; }
    exponentialRampToValueAtTime(value) { this.value = value; return this; }
    cancelScheduledValues() { return this; }
  }
  class Node {
    connect() { return this; }
    disconnect() { return this; }
  }
  class Osc extends Node {
    constructor() {
      super();
      this.frequency = new AudioParam();
      this.type = "sine";
    }
    start() { events.push({ kind: "osc", frequency: this.frequency.attack ?? this.frequency.value, type: this.type }); }
    stop() { events.push({ kind: "osc-stop" }); }
  }
  class Gain extends Node {
    constructor() {
      super();
      this.gain = new AudioParam();
    }
  }
  class Filter extends Node {
    constructor() {
      super();
      this.frequency = new AudioParam();
      this.Q = new AudioParam();
      this.type = "lowpass";
    }
  }
  class BufferSource extends Node {
    constructor() {
      super();
      this.loop = false;
      this.buffer = null;
    }
    start() { events.push({ kind: this.loop ? "bed" : "noise", loop: this.loop }); }
    stop() { events.push({ kind: this.loop ? "bed-stop" : "noise-stop" }); }
  }
  class AudioContext {
    constructor() {
      constructed += 1;
      this.currentTime = 0;
      this.sampleRate = 8000;
      this.state = mode === "blocked" ? "suspended" : "running";
      this.destination = new Node();
      this.resumeCalls = 0;
    }
    resume() {
      this.resumeCalls += 1;
      if (!(mode === "blocked" && this.resumeCalls === 1)) this.state = "running";
      events.push({ kind: "resume", call: this.resumeCalls, state: this.state });
      return Promise.resolve();
    }
    close() {
      this.state = "closed";
      events.push({ kind: "close" });
      return Promise.resolve();
    }
    createOscillator() { return new Osc(); }
    createGain() {
      const node = new Gain();
      gains.push(node);
      return node;
    }
    createBiquadFilter() { return new Filter(); }
    createBufferSource() { return new BufferSource(); }
    createBuffer(_channels, length, rate) {
      const data = new Float32Array(length);
      const buffer = {
        getChannelData: () => data,
        length,
        sampleRate: rate,
        duration: length / rate
      };
      buffers.push(buffer);
      return buffer;
    }
  }
  window.AudioContext = AudioContext;
  window.webkitAudioContext = AudioContext;
}

function boot({
  url = "http://127.0.0.1:4173/",
  date = [2026, 9, 30],
  seen = false,
  seenKey = "",
  playedDay = "",
  blockStorage = false,
  reduce = false,
  audio = "running",
  muted = null
} = {}) {
  const window = new Window({ url });
  mockDate(window, ...date);
  if (reduce) {
    window.matchMedia = () => ({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() { return false; }
    });
  }
  window.document.write(page);
  window.document.close();
  installAudio(window, audio);
  if (seen) window.localStorage.setItem(seenKey || `dd-halloween-intro-${date[0]}`, "seen");
  if (muted != null) window.localStorage.setItem("dd-halloween-audio-muted", muted);
  if (playedDay) window.localStorage.setItem("dd-halloween-intro-day", playedDay);
  if (blockStorage) {
    Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new Error("blocked"); } });
  }
  window.eval(intro);
  return window;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const quoted = `“${destiny.en}”`;

test("DESTINY copy is the dictionary entry, not generated filler", () => {
  assert.equal(destiny.word, "DESTINY");
  assert.equal(destiny.pos, "noun");
  assert.equal(
    destiny.en.replaceAll("’", "'"),
    "A tyrant's authority for crime and fool's excuse for failure."
  );
  assert.ok(html.includes(quoted), "homepage scroll quotes the real definition and nothing else");
  assert.equal(html.includes("hw-pos"), false);
  assert.equal(html.includes("<video"), false);
  assert.match(html, /halloween-intro\.css/);
  assert.match(html, /halloween-intro\.js/);
  assert.doesNotMatch(html, /<link rel="stylesheet" href="\.\/halloween-intro\.css"/);
  assert.match(html, /<script src="\/analytics\.js" defer><\/script>/);
  assert.match(html, /<script src="\.\/app\.js" defer><\/script>/);
  assert.match(html, /<script src="\/shop\.js" defer><\/script>/);
  assert.match(html, /month === 9 && day >= 24\) \|\| \(month === 10 && day <= 2\)/);
  assert.match(intro, /month === 9 && day >= 24\) \|\| \(month === 10 && day <= 2\)/);
});

test("homepage fetches Halloween css and js only inside the season, or when forced", () => {
  const head = html.match(/<script>\s*if \(!window\.Capacitor[\s\S]*?<\/script>/);
  assert.ok(head, "season gate lives in the early inline script");
  const source = head[0].replace(/^<script>/, "").replace(/<\/script>$/, "");

  function probe(date, url) {
    const window = new Window({ url, settings: { disableJavaScriptEvaluation: true } });
    mockDate(window, ...date);
    const written = [];
    window.document.write = (chunk) => { written.push(String(chunk)); };
    window.eval(source);
    const css = window.document.querySelector("link[data-halloween-css]");
    const scripts = written.join("\n");
    const result = {
      css: css ? css.getAttribute("href") : "",
      script: /<script src="\.\/halloween-intro\.js" defer>/.test(scripts),
    };
    window.close();
    return result;
  }

  const loaded = { css: "./halloween-intro.css", script: true };
  const skipped = { css: "", script: false };
  assert.deepEqual(probe([2026, 9, 23], "http://127.0.0.1:4173/"), skipped);
  assert.deepEqual(probe([2026, 9, 24], "http://127.0.0.1:4173/"), loaded);
  assert.deepEqual(probe([2026, 9, 31], "http://127.0.0.1:4173/"), loaded);
  assert.deepEqual(probe([2026, 10, 2], "http://127.0.0.1:4173/"), loaded);
  assert.deepEqual(probe([2026, 10, 3], "http://127.0.0.1:4173/"), skipped);
  assert.deepEqual(probe([2026, 6, 4], "http://127.0.0.1:4173/"), skipped);
  assert.deepEqual(probe([2026, 6, 4], "http://127.0.0.1:4173/?halloween=1"), loaded);
  assert.deepEqual(probe([2026, 9, 31], "http://127.0.0.1:4173/?halloween=0"), skipped);
});

test("season window is 24 October through 2 November, local time", () => {
  const window = boot();
  const { inSeason, openingChoice } = window.__HALLOWEEN_INTRO__;
  assert.equal(inSeason(new window.Date(2026, 9, 23)), false);
  assert.equal(inSeason(new window.Date(2026, 9, 24)), true);
  assert.equal(inSeason(new window.Date(2026, 9, 31)), true);
  assert.equal(inSeason(new window.Date(2027, 10, 1)), true);
  assert.equal(inSeason(new window.Date(2026, 10, 2)), true);
  assert.equal(inSeason(new window.Date(2026, 10, 3)), false);
  assert.equal(inSeason(new window.Date(2026, 6, 4)), false);
  window.localStorage.setItem("dd-halloween-intro-2026", "seen");
  assert.equal(openingChoice(new window.Date(2026, 9, 23)), "off");
  assert.equal(openingChoice(new window.Date(2026, 9, 31)), "play");
  assert.equal(openingChoice(new window.Date(2026, 10, 2)), "play");
  assert.equal(openingChoice(new window.Date(2026, 10, 3)), "off");
  window.__HALLOWEEN_INTRO__.stop();
  window.close();
});

test("first visit in season plays the intro and lights a real DESTINY row", () => {
  const window = boot();
  const { document } = window;
  const overlay = document.getElementById("halloweenIntro");
  assert.equal(overlay.hidden, false);
  assert.equal(overlay.classList.contains("scene-night"), true);
  assert.equal(document.body.classList.contains("hw-lock"), true);
  assert.equal(document.querySelector(".shell").getAttribute("aria-hidden"), "true");
  assert.equal(document.querySelector(".shell").inert, true);
  const cells = [...document.querySelectorAll("#halloweenGrid .hw-cell")];
  assert.equal(cells.length, 35);
  const destinyCells = cells.filter(cell => cell.dataset.destiny === "1");
  assert.equal(destinyCells.map(cell => cell.textContent).join(""), "DESTINY");
  assert.equal(document.getElementById("halloweenDef").textContent, quoted);
  assert.equal(
    document.getElementById("halloweenScroll").textContent.replace(/\s+/g, " ").trim(),
    `DESTINY ${quoted}`
  );
  assert.equal(document.getElementById("halloweenReplay").hidden, false);
  assert.equal(document.querySelector("h1").textContent, "The Devil’s Dictionary");
  window.__HALLOWEEN_INTRO__.stop();
  window.close();
});

test("the intro plays once per local day, and replay or ?halloween=1 still show it", async () => {
  const first = boot({ date: [2026, 9, 30] });
  assert.equal(first.document.getElementById("halloweenIntro").hidden, false, "first load of the day plays");
  assert.equal(first.localStorage.getItem("dd-halloween-intro-day"), "2026-10-30", "the day is stored as the intro starts");
  first.__HALLOWEEN_INTRO__.stop();
  first.close();

  const sameDay = boot({ date: [2026, 9, 30], playedDay: "2026-10-30" });
  assert.equal(sameDay.document.getElementById("halloweenIntro").hidden, true, "a second load that day goes straight to the game");
  assert.equal(sameDay.document.body.classList.contains("hw-lock"), false);
  assert.equal(sameDay.document.querySelector(".shell").inert, false);
  assert.equal(sameDay.__HALLOWEEN_INTRO__.openingChoice(), "seen");
  assert.equal(sameDay.__halloweenAudio.constructed(), 0, "no audio starts when the intro is skipped for the day");
  assert.equal(sameDay.document.getElementById("halloweenReplay").hidden, false, "replay stays available");
  sameDay.document.getElementById("halloweenReplay").click();
  assert.equal(sameDay.document.getElementById("halloweenIntro").hidden, false, "replay plays it on demand");
  sameDay.__HALLOWEEN_INTRO__.stop();
  sameDay.close();

  const nextDay = boot({ date: [2026, 9, 31], playedDay: "2026-10-30" });
  assert.equal(nextDay.document.getElementById("halloweenIntro").hidden, false, "the next day plays again");
  assert.equal(nextDay.localStorage.getItem("dd-halloween-intro-day"), "2026-10-31");
  nextDay.__HALLOWEEN_INTRO__.stop();
  nextDay.close();

  const forced = boot({ url: "http://127.0.0.1:4173/?halloween=1", date: [2026, 9, 30], playedDay: "2026-10-30" });
  assert.equal(forced.document.getElementById("halloweenIntro").hidden, false, "?halloween=1 plays even after today's showing");
  forced.__HALLOWEEN_INTRO__.stop();
  forced.close();

  const blocked = boot({ date: [2026, 9, 30], blockStorage: true });
  assert.equal(blocked.document.getElementById("halloweenIntro").hidden, false, "blocked storage still gets the intro");
  blocked.__HALLOWEEN_INTRO__.stop();
  blocked.close();
});

test("skip and Escape close this visit, and a fresh browser still plays", async () => {
  const window = boot();
  window.document.getElementById("halloweenSkip").click();
  await sleep(80);
  assert.equal(window.document.getElementById("halloweenIntro").hidden, false, "full-motion fade is still on screen");
  await sleep(700);
  assert.equal(window.document.getElementById("halloweenIntro").hidden, true);
  assert.equal(window.localStorage.getItem("dd-halloween-intro-2026"), null);
  assert.equal(window.document.body.classList.contains("hw-lock"), false);
  assert.equal(window.document.querySelector(".shell").inert, false);
  window.close();

  const again = boot({ seen: true });
  assert.equal(again.document.getElementById("halloweenIntro").hidden, false, "a leftover seen flag does not skip the season");
  assert.equal(again.__HALLOWEEN_INTRO__.openingChoice(new again.Date(2026, 9, 31)), "play");
  again.__HALLOWEEN_INTRO__.stop();
  again.document.getElementById("halloweenReplay").click();
  assert.equal(again.document.getElementById("halloweenIntro").hidden, false);
  again.document.dispatchEvent(new again.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  await sleep(700);
  assert.equal(again.document.getElementById("halloweenIntro").hidden, true);
  assert.equal(again.localStorage.getItem("dd-halloween-intro-2026"), "seen", "a leftover flag is ignored, not rewritten");
  again.close();
});

test("reduced motion opens on the readable definition and dismisses quickly", async () => {
  const window = boot({ reduce: true });
  const overlay = window.document.getElementById("halloweenIntro");
  assert.equal(overlay.classList.contains("hw-reduce"), true);
  assert.equal(overlay.classList.contains("scene-scroll"), true);
  assert.equal(overlay.classList.contains("scene-fire"), false);
  assert.equal(window.document.getElementById("halloweenDef").textContent, quoted);
  await sleep(120);
  assert.equal(overlay.hidden, false, "the card stays long enough to read");
  await sleep(1800);
  assert.equal(overlay.hidden, true);
  assert.equal(window.localStorage.getItem("dd-halloween-intro-2026"), null);
  assert.ok(window.__HALLOWEEN_INTRO__.audioCues.includes("card"), "reduced motion still plays the card chime");
  assert.equal(window.__HALLOWEEN_INTRO__.audioCues.includes("bats"), false);
  const frequencies = window.__halloweenAudio.events.filter(event => event.kind === "osc").map(event => event.frequency);
  assert.ok(frequencies.includes(440));
  assert.equal(frequencies.includes(784), false, "the bat chirp stays out of reduced motion");
  window.close();
});

test("query flags and the calendar gate the homepage without touching other pages", () => {
  const off = boot({ url: "http://127.0.0.1:4173/?halloween=0", date: [2026, 9, 31], seen: true });
  assert.equal(off.document.getElementById("halloweenIntro").hidden, true);
  assert.equal(off.document.getElementById("halloweenReplay").hidden, true);
  assert.equal(off.document.body.classList.contains("hw-lock"), false);
  assert.equal(off.__HALLOWEEN_INTRO__.openingChoice(), "off");
  off.close();

  const summer = boot({ date: [2026, 6, 4] });
  assert.equal(summer.document.getElementById("halloweenIntro").hidden, true);
  assert.equal(summer.document.getElementById("halloweenReplay").hidden, true);
  assert.equal(summer.__HALLOWEEN_INTRO__.openingChoice(), "off");
  summer.close();

  const forced = boot({
    url: "http://127.0.0.1:4173/?halloween=1&word=HOPE",
    date: [2026, 6, 4],
    seen: true
  });
  assert.equal(forced.document.getElementById("halloweenIntro").hidden, false);
  assert.equal(forced.__HALLOWEEN_INTRO__.openingChoice(), "play");
  forced.__HALLOWEEN_INTRO__.stop();
  forced.close();

  const nextYear = boot({ date: [2027, 9, 30], seen: true, seenKey: "dd-halloween-intro-2026" });
  assert.equal(nextYear.localStorage.getItem("dd-halloween-intro-2026"), "seen");
  assert.equal(nextYear.document.getElementById("halloweenIntro").hidden, false, "in season plays even with a leftover flag");
  nextYear.__HALLOWEEN_INTRO__.stop();
  nextYear.close();
});

test("intro audio is synthesized, gated with the overlay, and remembered when muted", async () => {
  const game = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(html, /id="halloweenSound"/);
  assert.match(intro, /dd-halloween-audio-muted/);
  assert.match(intro, /Original Web Audio synthesis|original Web Audio synthesis/);
  assert.doesNotMatch(intro, /\.mp3|\.ogg|\.wav|youtube|createElement\("audio"\)/i);
  assert.doesNotMatch(game, /dd-halloween-audio-muted/);
  assert.doesNotMatch(html, /<audio|\.mp3|\.wav|\.ogg/i);

  const playing = boot();
  const sound = playing.document.getElementById("halloweenSound");
  assert.equal(sound.classList.contains("is-muted"), false);
  assert.equal(sound.getAttribute("aria-pressed"), "false");
  assert.equal(sound.getAttribute("aria-label"), "Mute Halloween intro sound");
  assert.equal(playing.localStorage.getItem("dd-halloween-audio-muted"), null);
  assert.equal(playing.__halloweenAudio.constructed(), 1);
  assert.ok(playing.__halloweenAudio.events.some(event => event.kind === "bed"));
  const bed = playing.__halloweenAudio.buffers.find(buffer => buffer.length === 8000 * 4);
  assert.ok(bed, "ambient bed is a 4s generated buffer");
  let peak = 0;
  for (const sample of bed.getChannelData()) peak = Math.max(peak, Math.abs(sample));
  assert.ok(peak > 0.08 && peak < 0.9, `bed peak ${peak} stays audible and below clipping`);
  assert.ok(playing.__halloweenAudio.gains[0].gain.value > 0.5, "master opens when autoplay is allowed");

  sound.click();
  assert.equal(playing.localStorage.getItem("dd-halloween-audio-muted"), "1");
  assert.equal(sound.classList.contains("is-muted"), true);
  assert.equal(sound.querySelector(".hw-sound-label").textContent, "Muted");
  assert.equal(sound.getAttribute("aria-label"), "Unmute Halloween intro sound");
  assert.ok(playing.__halloweenAudio.events.some(event => event.kind === "bed-stop"));
  assert.equal(playing.__halloweenAudio.gains[0].gain.value, 0);

  playing.document.getElementById("halloweenSkip").click();
  assert.ok(playing.__halloweenAudio.events.some(event => event.kind === "close"));
  const bedsAfterSkip = playing.__halloweenAudio.events.filter(event => event.kind === "bed").length;
  await sleep(7500);
  assert.equal(playing.document.getElementById("halloweenIntro").hidden, true);
  assert.equal(playing.__HALLOWEEN_INTRO__.audioCues.includes("bats"), false, "skip cancels cues that have not played");
  assert.equal(playing.__halloweenAudio.events.filter(event => event.kind === "bed").length, bedsAfterSkip);
  playing.close();

  const remembered = boot({ muted: "1" });
  assert.equal(remembered.document.getElementById("halloweenIntro").hidden, false);
  assert.equal(remembered.document.getElementById("halloweenSound").classList.contains("is-muted"), true);
  assert.equal(remembered.__halloweenAudio.constructed(), 0, "a remembered mute does not start a context");
  assert.equal(remembered.__HALLOWEEN_INTRO__.audioMuted(), true);
  remembered.document.getElementById("halloweenSound").click();
  assert.equal(remembered.localStorage.getItem("dd-halloween-audio-muted"), "0");
  assert.equal(remembered.document.getElementById("halloweenSound").classList.contains("is-muted"), false);
  assert.ok(remembered.__halloweenAudio.events.some(event => event.kind === "bed"));
  remembered.__HALLOWEEN_INTRO__.stop();
  remembered.close();

  const replayMute = boot({ muted: "1" });
  replayMute.document.getElementById("halloweenSkip").click();
  await sleep(700);
  replayMute.document.getElementById("halloweenReplay").click();
  assert.equal(replayMute.document.getElementById("halloweenSound").classList.contains("is-muted"), true);
  assert.equal(replayMute.__halloweenAudio.constructed(), 0, "replay keeps a remembered mute");
  replayMute.close();

  const off = boot({ url: "http://127.0.0.1:4173/?halloween=0", date: [2026, 9, 31] });
  assert.equal(off.document.getElementById("halloweenIntro").hidden, true);
  assert.equal(off.__halloweenAudio.constructed(), 0);
  off.close();

  const seen = boot({ seen: true });
  assert.equal(seen.document.getElementById("halloweenIntro").hidden, false, "a leftover seen flag does not skip the season");
  assert.equal(seen.__halloweenAudio.constructed(), 1, "in-season audio still starts with a leftover seen flag");
  seen.__HALLOWEEN_INTRO__.stop();
  seen.close();
});

test("blocked autoplay shows muted until a gesture, including reduced motion", async () => {
  const blocked = boot({ audio: "blocked" });
  await sleep(0);
  const sound = blocked.document.getElementById("halloweenSound");
  assert.equal(sound.classList.contains("is-muted"), true);
  assert.equal(sound.getAttribute("aria-pressed"), "true");
  assert.equal(blocked.localStorage.getItem("dd-halloween-audio-muted"), null, "autoplay failure is not stored as a mute");
  assert.equal(blocked.__halloweenAudio.gains[0].gain.value, 0, "master stays closed while the context is suspended");
  assert.equal(blocked.__halloweenAudio.events.at(-1).state, "suspended");

  blocked.document.querySelector(".hw-stage").dispatchEvent(
    new blocked.PointerEvent("pointerdown", { bubbles: true, cancelable: true })
  );
  await sleep(0);
  assert.equal(sound.classList.contains("is-muted"), false);
  assert.equal(blocked.__halloweenAudio.events.some(event => event.kind === "resume" && event.state === "running"), true);
  assert.ok(blocked.__halloweenAudio.gains[0].gain.value > 0.5);
  blocked.document.getElementById("halloweenSkip").click();
  assert.ok(blocked.__halloweenAudio.events.some(event => event.kind === "close"), "skip still stops audio");
  blocked.close();

  const quiet = boot({ audio: "blocked", reduce: true });
  await sleep(0);
  assert.equal(quiet.__HALLOWEEN_INTRO__.audioCues.includes("card"), false, "the chime waits until audio can actually play");
  quiet.document.querySelector(".hw-brand").dispatchEvent(
    new quiet.PointerEvent("pointerdown", { bubbles: true, cancelable: true })
  );
  await sleep(0);
  assert.ok(quiet.__HALLOWEEN_INTRO__.audioCues.includes("card"));
  assert.equal(quiet.__HALLOWEEN_INTRO__.audioCues.includes("bats"), false);
  quiet.__HALLOWEEN_INTRO__.stop();
  quiet.close();

  const gone = boot();
  gone.dispatchEvent(new gone.Event("pagehide"));
  assert.ok(gone.__halloweenAudio.events.some(event => event.kind === "close"));
  assert.equal(gone.__halloweenAudio.gains[0].gain.value, 0);
  assert.equal(gone.document.getElementById("halloweenSound").classList.contains("is-muted"), true);
  gone.document.querySelector(".hw-stage").dispatchEvent(
    new gone.PointerEvent("pointerdown", { bubbles: true, cancelable: true })
  );
  await sleep(0);
  assert.equal(gone.document.getElementById("halloweenSound").classList.contains("is-muted"), false, "a later gesture can start audio again");
  assert.ok(gone.__halloweenAudio.events.filter(event => event.kind === "bed").length >= 2);
  gone.close();

  const toggled = boot();
  const toggle = toggled.document.getElementById("halloweenSound");
  toggle.dispatchEvent(new toggled.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
  toggle.click();
  assert.equal(toggled.localStorage.getItem("dd-halloween-audio-muted"), "1");
  assert.equal(toggle.classList.contains("is-muted"), true, "pointerdown and the click that follows it mute once");
  toggled.__HALLOWEEN_INTRO__.stop();
  toggled.close();

  const missing = boot({ audio: "missing" });
  assert.equal(missing.document.getElementById("halloweenIntro").hidden, false);
  assert.equal(missing.document.getElementById("halloweenSound").classList.contains("is-muted"), true);
  missing.document.getElementById("halloweenSound").click();
  assert.equal(missing.document.getElementById("halloweenIntro").hidden, false);
  missing.document.getElementById("halloweenSkip").click();
  await sleep(700);
  assert.equal(missing.document.getElementById("halloweenIntro").hidden, true);
  missing.close();
});

test("card and bat cues follow the intro beats", { timeout: 20_000 }, async () => {
  const window = boot();
  await sleep(4500);
  assert.ok(window.__HALLOWEEN_INTRO__.audioCues.includes("card"));
  assert.equal(window.__HALLOWEEN_INTRO__.audioCues.includes("bats"), false);
  assert.ok(window.__halloweenAudio.events.some(event => event.kind === "osc" && event.frequency === 440));
  await sleep(3500);
  assert.ok(window.__HALLOWEEN_INTRO__.audioCues.includes("bats"));
  assert.ok(window.__halloweenAudio.events.some(event => event.kind === "osc" && event.frequency === 784));
  window.__HALLOWEEN_INTRO__.stop();
  assert.ok(window.__halloweenAudio.events.some(event => event.kind === "close"));
  window.close();
});
