import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Window } from "happy-dom";
import { dailyEntry, loadEntries } from "../lib/landing.mjs";

const require = createRequire(import.meta.url);
const daily = require("../daily-puzzle.js");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "app.js"), "utf8");
const dailyScript = fs.readFileSync(path.join(root, "daily-puzzle.js"), "utf8");
const entries = loadEntries();

function boot({ url = "http://127.0.0.1:4173/", now = null, dailyState = null } = {}) {
  const window = new Window({ url });
  window.document.write(html
    .replace(/<script>\s*if \(!window\.Capacitor[\s\S]*?<\/script>/, "")
    .replace(/<script src="\.\/daily-puzzle\.js"(?: defer)?><\/script>\s*/, "")
    .replace(/<script src="\.\/app\.js"(?: defer)?><\/script>/, ""));
  window.document.close();
  window.Element.prototype.setPointerCapture = () => {};
  window.Element.prototype.animate = () => ({ finished: Promise.resolve() });
  window.__tracked = [];
  window.ddTrack = (name, data) => window.__tracked.push([name, data ? { ...data } : data]);
  window.localStorage.setItem("devils-dictionary-save-v3", JSON.stringify({
    completed: [], order: [], current: null, hints: 0, rounds: 0,
    judgment: { comfort: 0, order: 0, correct: 0, firstTry: 0 }, sound: false
  }));
  if (now) window.__DD_NOW__ = now;
  if (dailyState) window.localStorage.setItem(daily.STORAGE_KEY, JSON.stringify(dailyState));
  window.eval(dailyScript);
  window.eval(script);
  return window;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test("the same UTC day selects the same word as /daily, and the next UTC day does not", () => {
  assert.equal(daily.TIMEZONE, "UTC");
  const morning = new Date("2026-10-27T00:30:00Z");
  const evening = new Date("2026-10-27T23:30:00Z");
  const next = new Date("2026-10-28T00:05:00Z");
  assert.equal(daily.utcDateKey(morning), daily.utcDateKey(evening));
  assert.equal(daily.dailyWordIndex(morning, entries.length), daily.dailyWordIndex(evening, entries.length));
  assert.equal(entries[daily.dailyWordIndex(morning, entries.length)].word, dailyEntry(morning).word);
  assert.equal(entries[daily.dailyWordIndex(evening, entries.length)].word, dailyEntry(evening).word);
  assert.notEqual(daily.dailyWordIndex(morning, entries.length), daily.dailyWordIndex(next, entries.length));
  assert.notEqual(dailyEntry(morning).word, dailyEntry(next).word);
  assert.equal(daily.puzzleNumber(morning), daily.puzzleNumber(evening));
  assert.equal(daily.puzzleNumber(next), daily.puzzleNumber(morning) + 1);

  // 20:30 in Los Angeles on 27 October is already 28 October UTC.
  // The puzzle follows UTC so it stays the word /daily publishes.
  const pacificAfternoon = new Date("2026-10-27T12:00:00-07:00");
  const pacificEvening = new Date("2026-10-27T20:30:00-07:00");
  assert.equal(daily.utcDateKey(pacificAfternoon), "2026-10-27");
  assert.equal(daily.utcDateKey(pacificEvening), "2026-10-28");
  assert.notEqual(daily.dailyWordIndex(pacificAfternoon, entries.length), daily.dailyWordIndex(pacificEvening, entries.length));
});

test("a streak grows on consecutive UTC days, holds through today, and breaks after a missed day", () => {
  assert.equal(daily.previousDateKey("2026-03-01"), "2026-02-28");
  assert.equal(daily.previousDateKey("2028-03-01"), "2028-02-29");

  let state = daily.emptyDailyState();
  let step = daily.recordSolve(state, "2026-01-01", { misses: 2, hinted: false, length: 4 });
  assert.equal(step.changed, true);
  assert.equal(step.state.streak, 1);
  assert.equal(step.state.best, 1);
  assert.equal(step.state.lastSolved, "2026-01-01");
  state = step.state;

  const repeat = daily.recordSolve(state, "2026-01-01", { misses: 9, hinted: true, length: 4 });
  assert.equal(repeat.changed, false);
  assert.equal(repeat.state.streak, 1);
  assert.equal(repeat.state.best, 1);
  assert.equal(repeat.state.solved["2026-01-01"].misses, 2);
  assert.equal(repeat.state.solved["2026-01-01"].hinted, false);

  assert.equal(daily.visibleStreak(state, "2026-01-01"), 1);
  assert.equal(daily.visibleStreak(state, "2026-01-02"), 1);
  assert.equal(daily.visibleStreak(state, "2026-01-03"), 0);

  step = daily.recordSolve(state, "2026-01-02", { misses: 0, length: 4 });
  assert.equal(step.changed, true);
  assert.equal(step.state.streak, 2);
  assert.equal(step.state.best, 2);
  state = step.state;

  step = daily.recordSolve(state, "2026-01-04", { misses: 1, length: 5 });
  assert.equal(step.state.streak, 1);
  assert.equal(step.state.best, 2);
  assert.equal(step.state.lastSolved, "2026-01-04");
  assert.equal(daily.visibleStreak(step.state, "2026-01-04"), 1);
  assert.equal(daily.visibleStreak(step.state, "2026-01-05"), 1);
});

test("the share result has a score, a streak, a date, and a link, and never the answer", () => {
  for (const entry of entries) {
    const text = daily.shareResult({
      puzzle: 12,
      dateKey: "2026-01-12",
      length: entry.word.length,
      misses: 2,
      streak: 4,
      hinted: true,
      word: entry.word,
      en: entry.en
    });
    assert.equal(text.toUpperCase().includes(entry.word), false, entry.word);
    assert.equal(text.includes(entry.en), false, entry.word);
    assert.equal(text.includes("?word="), false);
    const rows = text.split("\n");
    assert.equal(rows[0], "The Devil’s Dictionary #12");
    assert.equal(rows[1], "2026-01-12 UTC");
    assert.equal(rows[2], "⬛".repeat(entry.word.length));
    assert.equal(rows[3], "⬛".repeat(entry.word.length));
    assert.equal(rows[4], "🟩".repeat(entry.word.length));
    assert.equal(rows[5], "Streak 4");
    assert.equal(rows[6], "Hint used");
    assert.equal(rows[7], "https://devildictionary.com/?daily=1");
  }

  const clean = daily.shareResult({ puzzle: 2, dateKey: "2026-01-02", length: 4, misses: 0, streak: 3, hinted: false });
  assert.equal(clean, "The Devil’s Dictionary #2\n2026-01-02 UTC\n🟩🟩🟩🟩\nStreak 3\nhttps://devildictionary.com/?daily=1");
  const overflow = daily.shareResult({ puzzle: 1, dateKey: "2026-01-01", length: 3, misses: 8, streak: 1, hinted: false });
  assert.equal((overflow.match(/⬛⬛⬛/g) || []).length, 6);
  assert.match(overflow, /\+2 more/);
  assert.equal(overflow.includes("EGO"), false);
});

test("the daily board is the shared UTC word, masked until it is solved", async () => {
  const when = "2026-01-01T15:00:00Z";
  const word = dailyEntry(new Date(when)).word;
  assert.equal(word, "EGO");
  const window = boot({ url: "http://127.0.0.1:4173/?daily=1&word=HOPE", now: when });
  const state = window.__DEVILS_GAME__.getState();
  assert.equal(state.mode, "daily");
  assert.equal(state.round.entry.word, "EGO");
  assert.equal(state.completed.length, 0);
  const target = window.document.getElementById("targetWord");
  assert.match(target.innerHTML, /class="mask"/);
  assert.notEqual(target.textContent, "EGO");
  assert.equal(target.textContent.includes("EGO"), false);
  assert.equal(target.textContent.includes("HOPE"), false);
  assert.equal(window.document.body.classList.contains("is-daily-solved"), false);
  assert.deepEqual(window.__tracked.map(entry => entry[0]), ["Daily start", "Game start"]);
  assert.equal(window.__tracked.some(entry => entry[0] === "Word complete"), false);
  window.close();
});

test("solving today’s puzzle raises the streak, leaves the campaign alone, and copies a spoiler-free result", async () => {
  const first = boot({ url: "http://127.0.0.1:4173/?daily=1", now: "2026-01-01T12:00:00Z" });
  const copied = [];
  const opened = [];
  Object.defineProperty(first.navigator, "clipboard", {
    configurable: true,
    value: { writeText: async text => { copied.push(text); } }
  });
  first.open = url => { opened.push(String(url)); return { closed: false }; };
  first.__DEVILS_GAME__.solveCurrent();
  await sleep(1200);
  assert.equal(first.document.getElementById("definitionModal").classList.contains("open"), true);
  assert.equal(first.document.getElementById("definitionWord").textContent, "EGO");
  assert.equal(first.__DEVILS_GAME__.getState().completed.length, 0);
  assert.equal(first.document.getElementById("nextButton").textContent, "DONE FOR TODAY");
  first.document.getElementById("copyWordButton").click();
  first.document.getElementById("shareWordButton").click();
  await sleep(30);
  const stored = JSON.parse(first.localStorage.getItem(daily.STORAGE_KEY));
  assert.equal(stored.streak, 1);
  assert.equal(stored.best, 1);
  assert.equal(stored.lastSolved, "2026-01-01");
  assert.equal(stored.solved["2026-01-01"].word, undefined);
  for (const text of [copied[0], new URL(opened[0]).searchParams.get("text")]) {
    assert.equal(text.includes("EGO"), false);
    assert.equal(text.includes("pocket mirror"), false);
    assert.match(text, /🟩🟩🟩/);
    assert.match(text, /Streak 1/);
    assert.match(text, /2026-01-01 UTC/);
    assert.match(text, /https:\/\/devildictionary\.com\/\?daily=1/);
  }
  assert.equal(first.__tracked.some(entry => entry[0] === "Word complete"), false);
  assert.equal(first.__tracked.some(entry => entry[0] === "Daily complete" && entry[1].streak === 1), true);
  assert.equal(first.__tracked.some(entry => entry[0] === "Daily streak" && entry[1].streak === 1), true);
  assert.equal(first.__tracked.filter(entry => entry[0] === "Daily share").length, 2);
  assert.equal(first.__tracked.some(entry => entry[0] === "Daily share" && entry[1].word), false);

  first.document.getElementById("nextButton").click();
  const preview = first.document.getElementById("dailySharePreview").textContent;
  assert.equal(preview.includes("EGO"), false);
  assert.match(preview, /Streak 1/);
  assert.equal(first.document.body.classList.contains("is-daily-solved"), true);
  assert.equal(first.document.getElementById("dailyStreakLabel").textContent, "Streak 1 · Best 1");

  const carried = first.localStorage.getItem(daily.STORAGE_KEY);
  first.close();

  const second = boot({
    url: "http://127.0.0.1:4173/?daily=1",
    now: "2026-01-02T08:00:00Z",
    dailyState: JSON.parse(carried)
  });
  assert.equal(second.__DEVILS_GAME__.getState().round.entry.word, "HOPE");
  assert.equal(second.document.getElementById("dailyStreakLabel").textContent, "Streak 1 · Best 1");
  second.__DEVILS_GAME__.solveCurrent();
  await sleep(1200);
  const after = JSON.parse(second.localStorage.getItem(daily.STORAGE_KEY));
  assert.equal(after.streak, 2);
  assert.equal(after.best, 2);
  assert.equal(after.lastSolved, "2026-01-02");
  assert.equal(second.__DEVILS_GAME__.getState().completed.length, 0);
  second.document.getElementById("nextButton").click();
  assert.equal(second.document.getElementById("dailySharePreview").textContent.includes("HOPE"), false);
  assert.match(second.document.getElementById("dailySharePreview").textContent, /Streak 2/);
  const secondSave = second.localStorage.getItem(daily.STORAGE_KEY);
  second.close();

  const replay = boot({
    url: "http://127.0.0.1:4173/?daily=1",
    now: "2026-01-02T18:00:00Z",
    dailyState: JSON.parse(secondSave)
  });
  assert.equal(replay.document.body.classList.contains("is-daily-solved"), true);
  assert.equal(replay.document.querySelectorAll(".letter").length, 0);
  assert.equal(replay.document.getElementById("dailyResult").hidden, false);
  const again = replay.document.getElementById("dailySharePreview").textContent;
  assert.equal(again.includes("HOPE"), false);
  assert.equal(again.includes("loan taken from tomorrow"), false);
  assert.match(again, /Streak 2/);
  assert.equal(replay.__tracked.some(entry => entry[0] === "Daily start"), false);
  assert.equal(replay.__tracked.some(entry => entry[0] === "Daily complete"), false);
  assert.equal(JSON.parse(replay.localStorage.getItem(daily.STORAGE_KEY)).streak, 2);
  replay.document.getElementById("campaignMode").click();
  assert.equal(replay.document.body.classList.contains("is-daily"), false);
  assert.ok(replay.document.querySelectorAll(".letter").length >= 25);
  assert.equal(replay.__DEVILS_GAME__.getState().completed.length, 0);
  replay.close();
});
