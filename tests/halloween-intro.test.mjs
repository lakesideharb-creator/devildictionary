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

function boot({ url = "http://127.0.0.1:4173/", date = [2026, 9, 30], seen = false, seenKey = "", reduce = false } = {}) {
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
  if (seen) window.localStorage.setItem(seenKey || `dd-halloween-intro-${date[0]}`, "seen");
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

test("skip and Escape close this visit, and the next load still plays", async () => {
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
  assert.equal(again.localStorage.getItem("dd-halloween-intro-2026"), "seen");
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
