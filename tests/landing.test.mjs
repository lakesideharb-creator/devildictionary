import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import handler from "../api/daily.mjs";
import subscribe from "../api/subscribe.mjs";
import {
  dailyEntry,
  entryBySlug,
  loadEntries,
  renderDailyHtml,
  renderNotFoundHtml,
  renderWordHtml,
  slugFor,
  xIntentUrl
} from "../lib/landing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("dictionary entries stay unique and load from the game", () => {
  const entries = loadEntries();
  assert.equal(entries.length, 100);
  assert.equal(new Set(entries.map(entry => entry.word)).size, 100);
});

test("the daily word is stable within a UTC day and changes the next day", () => {
  const first = dailyEntry(new Date("2026-10-22T00:30:00Z"));
  const later = dailyEntry(new Date("2026-10-22T23:30:00Z"));
  const next = dailyEntry(new Date("2026-10-23T00:05:00Z"));
  assert.equal(first.word, later.word);
  assert.notEqual(first.word, next.word);
  assert.equal(entryBySlug(slugFor(first.word)).en, first.en);
});

test("word and daily pages expose OG tags, the slogan, and a play link", () => {
  const entry = entryBySlug("ambition");
  const word = renderWordHtml(entry);
  assert.match(word, /property="og:title" content="AMBITION — The Devil’s Dictionary"/);
  assert.match(word, /property="og:image" content="https:\/\/devildictionary\.com\/og\/ambition\.jpg"/);
  assert.match(word, /name="twitter:card" content="summary_large_image"/);
  assert.match(word, /rel="canonical" href="https:\/\/devildictionary\.com\/word\/ambition"/);
  assert.match(word, /Find the word\. Face the truth\./);
  assert.match(word, /href="\/\?word=AMBITION"/);
  assert.ok(word.includes(entry.en));
  const daily = renderDailyHtml(entry, new Date("2026-10-22T12:00:00Z"));
  assert.match(daily, /rel="canonical" href="https:\/\/devildictionary\.com\/daily"/);
  assert.match(daily, /Today’s word/);
  assert.match(daily, /property="og:image"/);
  assert.match(daily, /https:\/\/www\.youtube\.com\/@DevilsDictionary/);
  assert.match(daily, /https:\/\/www\.instagram\.com\/lakesideharb\//);
  assert.match(daily, /https:\/\/x\.com\/Lakesideobhj/);
});

test("X intent uses @Lakesideobhj and the game campaign", () => {
  const intent = new URL(xIntentUrl("HOPE\nhttps://devildictionary.com/?utm_source=x&utm_medium=share&utm_campaign=game"));
  assert.equal(intent.searchParams.get("via"), "Lakesideobhj");
  assert.equal(intent.searchParams.get("utm_source"), "x");
  assert.equal(intent.searchParams.get("utm_medium"), "share");
  assert.equal(intent.searchParams.get("utm_campaign"), "game");
});

test("the missing page is a branded home link, not a plain-text error", () => {
  const html = renderNotFoundHtml();
  assert.match(html, /Page not found — The Devil’s Dictionary/);
  assert.match(html, /href="\/"/);
  assert.match(html, /noindex/);
  assert.match(html, /Find the word\. Face the truth\./);
});

test("/daily returns 200 HTML with OG tags", () => {
  const chunks = [];
  const res = {
    statusCode: 0,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    end(body) { chunks.push(body); }
  };
  handler({ url: "/daily" }, res);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers["Content-Type"], /text\/html/);
  const html = chunks.join("");
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:card"/);
  assert.match(html, /Find the word\. Face the truth\./);
  assert.match(html, /action="\/api\/subscribe"/);
  assert.match(html, /src="\/analytics\.js"/);
  assert.match(html, /Nothing you type is saved/);
  assert.doesNotMatch(html, /you(?:’|')re subscribed|api[_-]?key|RESEND|buttondown/i);
});

test("the subscribe stub does not store or echo an address", () => {
  const chunks = [];
  const req = {
    method: "POST",
    on(event, fn) {
      if (event === "data") fn(Buffer.from(JSON.stringify({ email: "person@example.com" })));
      if (event === "end") fn();
    }
  };
  const res = {
    statusCode: 0,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    end(body) { chunks.push(body); }
  };
  subscribe(req, res);
  const payload = chunks.join("");
  const json = JSON.parse(payload);
  assert.equal(res.statusCode, 501);
  assert.equal(json.ok, false);
  assert.equal(json.status, "coming_soon");
  assert.match(json.message, /not saved/i);
  assert.equal(res.headers["Cache-Control"], "no-store");
  assert.doesNotMatch(payload, /person@example\.com/);

  const refused = [];
  const other = {
    statusCode: 0,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    end(body) { refused.push(body); }
  };
  subscribe({ method: "GET" }, other);
  assert.equal(other.statusCode, 405);
  assert.equal(JSON.parse(refused.join("")).status, "method_not_allowed");
});

test("privacy names Vercel Web Analytics and the homepage keeps the slogan", () => {
  const privacy = fs.readFileSync(path.join(root, "privacy.html"), "utf8");
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(privacy, /Vercel Web Analytics/);
  assert.match(privacy, /third-party cookies/);
  assert.match(privacy, /does not store the address/);
  assert.doesNotMatch(privacy, /no analytics/i);
  assert.match(index, /Find the word\. Face the truth\./);
  assert.match(index, /action="\/api\/subscribe"/);
  assert.match(index, /src="\/analytics\.js"/);
  assert.match(fs.readFileSync(path.join(root, "app.js"), "utf8"), /ddTrack\?\.\("Game start"\)/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, "editor.html"), "utf8"), /analytics\.js/);
});

test("the header engraving is a small 480px asset with webp and avif siblings", () => {
  const png = fs.statSync(path.join(root, "assets/devil-engraving.png"));
  const webp = fs.statSync(path.join(root, "assets/devil-engraving.webp"));
  const avif = fs.statSync(path.join(root, "assets/devil-engraving.avif"));
  const ico = fs.statSync(path.join(root, "assets/favicon.ico"));
  assert.ok(png.size < 250 * 1024, `png fallback is ${png.size} bytes`);
  assert.ok(webp.size < 30 * 1024, `webp is ${webp.size} bytes`);
  assert.ok(avif.size < 30 * 1024, `avif is ${avif.size} bytes`);
  assert.ok(ico.size > 0);
  const card = fs.statSync(path.join(root, "assets/og-words/ambition.jpg"));
  assert.ok(card.size > 1000);
});
