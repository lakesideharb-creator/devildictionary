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
  assert.match(daily, /aria-label="Follow on X"/);
  assert.match(daily, /aria-label="YouTube: Devil's Dictionary"/);
  assert.match(daily, /aria-label="Instagram @lakesideharb"/);
  assert.doesNotMatch(daily, /intent\/follow|Visit @|Follow on YouTube|Follow on Instagram/);
  const social = daily.match(/<nav class="social-links"[\s\S]*?<\/nav>/);
  assert.equal((social[0].match(/<a /g) || []).length, 3);
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
  assert.match(html, /Each morning, one letter with the day’s word and a link to play it\./);
  assert.match(html, /An address is saved only after the list accepts it/);
  assert.match(html, /Send me the letter/);
  assert.doesNotMatch(html, /waitlist|No daily letter|you(?:’|')re subscribed|api[_-]?key|RESEND|buttondown/i);
});

const AUDIENCE = "78261eea-8f8b-4381-83c6-79fa7120f1cf";

function mockResponse() {
  const chunks = [];
  return {
    statusCode: 0,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    end(body) { chunks.push(body); },
    text() { return chunks.join(""); },
    json() { return JSON.parse(this.text()); }
  };
}

function postRequest(body, contentType = "application/json") {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: { "content-type": contentType },
    on(event, fn) {
      if (event === "data") fn(Buffer.from(raw));
      if (event === "end") fn();
    }
  };
}

async function withResend(fetchImpl, run) {
  const previous = {
    key: process.env.RESEND_API_KEY,
    id: process.env.RESEND_AUDIENCE_ID,
    fetch: globalThis.fetch
  };
  const logs = [];
  const originals = ["log", "info", "warn", "error", "debug"].map(name => [name, console[name]]);
  for (const [name] of originals) console[name] = (...args) => logs.push(args.map(String).join(" "));
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_AUDIENCE_ID = AUDIENCE;
  globalThis.fetch = fetchImpl;
  try {
    return await run(logs);
  } finally {
    globalThis.fetch = previous.fetch;
    for (const [name, fn] of originals) console[name] = fn;
    if (previous.key == null) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous.key;
    if (previous.id == null) delete process.env.RESEND_AUDIENCE_ID;
    else process.env.RESEND_AUDIENCE_ID = previous.id;
  }
}

test("subscribe stores an address with Resend and never echoes or logs it", async () => {
  const calls = [];
  await withResend(async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ object: "contact", id: "479e3145-dd38-476b-932c-529ceb705947" }), { status: 200 });
  }, async logs => {
    const res = mockResponse();
    await subscribe(postRequest({ email: "Person@Example.com" }), res);
    const payload = res.text();
    const json = res.json();
    assert.equal(res.statusCode, 200);
    assert.equal(json.ok, true);
    assert.equal(json.status, "subscribed");
    assert.match(json.message, /on the list/i);
    assert.match(json.message, /Each morning brings one letter/);
    assert.doesNotMatch(json.message, /waitlist|No daily letter/i);
    assert.equal(res.headers["Cache-Control"], "no-store");
    assert.doesNotMatch(payload, /person@example\.com/i);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.resend.com/contacts");
    assert.equal(calls[0].init.headers.Authorization, "Bearer re_test_key");
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      email: "person@example.com",
      unsubscribed: false,
      segments: [{ id: AUDIENCE }]
    });
    assert.doesNotMatch(logs.join("\n"), /person@example\.com|re_test_key/i);

    const form = mockResponse();
    await subscribe(postRequest("email=person%40example.com", "application/x-www-form-urlencoded"), form);
    assert.equal(form.statusCode, 200);
    assert.equal(form.json().status, "subscribed");
    assert.doesNotMatch(form.text(), /person@example\.com/i);
  });

  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_AUDIENCE_ID;
  const missing = mockResponse();
  let fetched = false;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => { fetched = true; return new Response("{}", { status: 200 }); };
  try {
    await subscribe(postRequest({ email: "person@example.com" }), missing);
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(missing.statusCode, 503);
  assert.equal(missing.json().status, "not_configured");
  assert.match(missing.json().message, /not configured/i);
  assert.doesNotMatch(missing.json().message, /waitlist|on the list/i);
  assert.doesNotMatch(missing.text(), /person@example\.com/i);
  assert.equal(fetched, false);

  const invalid = mockResponse();
  await withResend(async () => {
    throw new Error("fetch should not run");
  }, async () => {
    await subscribe(postRequest({ email: "not-an-email" }), invalid);
  });
  assert.equal(invalid.statusCode, 400);
  assert.equal(invalid.json().status, "invalid_email");
  assert.match(invalid.json().message, /not saved/i);

  const refused = mockResponse();
  await subscribe({ method: "GET" }, refused);
  assert.equal(refused.statusCode, 405);
  assert.equal(refused.json().status, "method_not_allowed");

  const callsForDuplicate = [];
  await withResend(async (url, init) => {
    callsForDuplicate.push({ url: String(url), method: init.method || "POST" });
    if (callsForDuplicate.length === 1) {
      return new Response(JSON.stringify({ name: "validation_error", message: "Contact already exists" }), { status: 409 });
    }
    return new Response(JSON.stringify({ id: AUDIENCE }), { status: 200 });
  }, async () => {
    const res = mockResponse();
    await subscribe(postRequest({ email: "person@example.com" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().ok, true);
    assert.equal(res.json().status, "subscribed");
    assert.doesNotMatch(res.text(), /person@example\.com/i);
  });
  assert.deepEqual(callsForDuplicate.map(call => call.method), ["POST", "PATCH", "POST"]);
  assert.match(callsForDuplicate[1].url, /\/contacts\/person%40example\.com$/);
  assert.match(callsForDuplicate[2].url, new RegExp(`/segments/${AUDIENCE}$`));

  await withResend(async () => new Response("nope", { status: 500 }), async () => {
    const res = mockResponse();
    await subscribe(postRequest({ email: "person@example.com" }), res);
    assert.equal(res.statusCode, 502);
    assert.equal(res.json().status, "upstream_error");
    assert.doesNotMatch(res.json().message, /waitlist|on the list/i);
    assert.doesNotMatch(res.text(), /person@example\.com/i);
  });
});

test("privacy names Vercel Web Analytics and Resend, and the homepage keeps the slogan", () => {
  const privacy = fs.readFileSync(path.join(root, "privacy.html"), "utf8");
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(privacy, /Vercel Web Analytics/);
  assert.match(privacy, /third-party cookies/);
  assert.match(privacy, /Resend/);
  assert.match(privacy, /unsubscribe/i);
  assert.match(privacy, /one letter each morning/);
  assert.match(privacy, /day’s word/);
  assert.doesNotMatch(privacy, /No daily letter is sent yet|waitlist/i);
  assert.match(privacy, /support@devildictionary\.com/);
  assert.doesNotMatch(privacy, /does not store the address|list is not open yet|no analytics/i);
  const faq = fs.readFileSync(path.join(root, "faq.html"), "utf8");
  assert.match(faq, /morning letter/);
  assert.match(faq, /one email a day/);
  assert.doesNotMatch(faq, /waitlist|no daily letter is sent yet|does not save the address/i);
  assert.match(index, /Find the word\. Face the truth\./);
  assert.match(index, /Send me the letter/);
  assert.match(index, /Each morning, one letter with the day’s word/);
  assert.doesNotMatch(index, /waitlist|No daily letter|The day’s word, by email/i);
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
