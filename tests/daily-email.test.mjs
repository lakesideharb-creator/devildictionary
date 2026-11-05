import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";
import { handleSendDaily } from "../api/send-daily.mjs";
import { dailyEntry } from "../lib/landing.mjs";
import {
  DEFAULT_FROM,
  PREVIEW,
  SUBJECT,
  TEST_UNSUBSCRIBE,
  UNSUBSCRIBE_PLACEHOLDER,
  broadcastName,
  buildLetter
} from "../lib/daily-letter.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIENCE = "78261eea-8f8b-4381-83c6-79fa7120f1cf";
const WHEN = new Date("2026-10-22T15:00:00Z");
const BROADCAST = "559ac32e-9ef5-46fb-82a1-b76b840c0f7b";
const SECRET = "cron-secret-value";

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

function authed(url, headers = {}) {
  return {
    method: "GET",
    url,
    headers: { authorization: `Bearer ${SECRET}`, ...headers }
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

async function withEnv(run, { fetchImpl } = {}) {
  const previous = {
    key: process.env.RESEND_API_KEY,
    id: process.env.RESEND_AUDIENCE_ID,
    from: process.env.RESEND_FROM,
    secret: process.env.CRON_SECRET
  };
  const logs = [];
  const originals = ["log", "info", "warn", "error", "debug"].map(name => [name, console[name]]);
  for (const [name] of originals) console[name] = (...args) => logs.push(args.map(String).join(" "));
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_AUDIENCE_ID = AUDIENCE;
  delete process.env.RESEND_FROM;
  process.env.CRON_SECRET = SECRET;
  try {
    return await run(logs, fetchImpl);
  } finally {
    for (const [name, fn] of originals) console[name] = fn;
    for (const [env, value] of [
      ["RESEND_API_KEY", previous.key],
      ["RESEND_AUDIENCE_ID", previous.id],
      ["RESEND_FROM", previous.from],
      ["CRON_SECRET", previous.secret]
    ]) {
      if (value == null) delete process.env[env];
      else process.env[env] = value;
    }
  }
}

test("the letter teases in the subject and reveals the word in the body", () => {
  const entry = dailyEntry(WHEN);
  const letter = buildLetter(entry, WHEN);
  assert.equal(letter.subject, SUBJECT);
  assert.equal(letter.preview, PREVIEW);
  assert.equal(letter.name, "daily-letter-2026-10-22");
  assert.equal(letter.subject.includes(entry.word), false);
  assert.equal(letter.preview.toLowerCase().includes(entry.word.toLowerCase()), false);
  assert.equal(letter.html.includes(entry.word), true);
  assert.equal(letter.html.includes(entry.en), true);
  assert.equal(letter.text.includes(entry.en), true);
  assert.match(letter.html, /Find the word\. Face the truth\./);
  assert.match(letter.html, new RegExp(UNSUBSCRIBE_PLACEHOLDER.replaceAll("{", "\\{").replaceAll("}", "\\}")));

  const window = new Window({ url: "https://devildictionary.com/" });
  window.document.write(letter.html);
  window.document.close();
  const doc = window.document;
  assert.equal(doc.querySelector("h1").textContent, SUBJECT);
  assert.equal(doc.querySelectorAll("script").length, 0);
  const play = doc.querySelector("a[href*='?word=']");
  const daily = [...doc.querySelectorAll("a")].find(anchor => anchor.getAttribute("href") === "https://devildictionary.com/daily");
  const unsubscribe = [...doc.querySelectorAll("a")].find(anchor => anchor.textContent === "Unsubscribe");
  assert.equal(play.getAttribute("href"), `https://devildictionary.com/?word=${encodeURIComponent(entry.word)}`);
  assert.equal(play.textContent, "Play this word");
  const puzzle = [...doc.querySelectorAll("a")].find(anchor => anchor.getAttribute("href") === "https://devildictionary.com/?daily=1");
  assert.equal(puzzle.textContent, "Play today’s puzzle");
  assert.match(letter.text, /Play today’s puzzle: https:\/\/devildictionary\.com\/\?daily=1/);
  assert.ok(daily);
  assert.equal(unsubscribe.getAttribute("href"), UNSUBSCRIBE_PLACEHOLDER);
  assert.equal(doc.body.textContent.includes(entry.word), true);
  assert.equal(doc.body.textContent.includes(entry.en), true);
  assert.match(doc.body.textContent, /Find the word\. Face the truth\./);
});

test("letter HTML escapes the entry instead of planting markup", () => {
  const letter = buildLetter({
    word: "A&B<C>",
    pos: "noun",
    en: "A <script>alert(\"x\")</script> definition"
  }, WHEN);
  assert.doesNotMatch(letter.html, /<script/i);
  assert.match(letter.html, /A&amp;B&lt;C&gt;/);
  assert.match(letter.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  const window = new Window({ url: "https://devildictionary.com/" });
  window.document.write(letter.html);
  window.document.close();
  assert.equal(window.document.querySelectorAll("script").length, 0);
  assert.match(window.document.body.textContent, /A&B<C>/);
  assert.match(window.document.body.textContent, /<script>alert\("x"\)<\/script>/);
});

test("cron auth rejects a missing secret, a wrong bearer, and a spoofed cron header", async () => {
  const calls = [];
  const fetchImpl = async () => {
    calls.push("fetch");
    throw new Error("fetch should not run");
  };
  await withEnv(async () => {
    const missing = mockResponse();
    await handleSendDaily({ method: "GET", url: "/api/send-daily", headers: {} }, missing, { fetch: fetchImpl, now: WHEN });
    assert.equal(missing.statusCode, 401);
    assert.equal(missing.json().status, "unauthorized");

    const wrong = mockResponse();
    await handleSendDaily(authed("/api/send-daily", { authorization: "Bearer not-the-secret" }), wrong, { fetch: fetchImpl, now: WHEN });
    assert.equal(wrong.statusCode, 401);

    const spoofed = mockResponse();
    await handleSendDaily({
      method: "GET",
      url: "/api/send-daily",
      headers: {
        "user-agent": "vercel-cron/1.0",
        "x-vercel-cron": "1",
        "x-vercel-cron-schedule": "0 15 * * *"
      }
    }, spoofed, { fetch: fetchImpl, now: WHEN });
    assert.equal(spoofed.statusCode, 401);
    assert.equal(spoofed.json().ok, false);

    delete process.env.CRON_SECRET;
    const unset = mockResponse();
    await handleSendDaily(authed("/api/send-daily"), unset, { fetch: fetchImpl, now: WHEN });
    assert.equal(unset.statusCode, 401);

    const method = mockResponse();
    process.env.CRON_SECRET = SECRET;
    await handleSendDaily({ method: "DELETE", url: "/api/send-daily", headers: { authorization: `Bearer ${SECRET}` } }, method, { fetch: fetchImpl, now: WHEN });
    assert.equal(method.statusCode, 405);
    assert.equal(method.headers.Allow, "GET, POST");
  });
  assert.equal(calls.length, 0);
});

test("a dry run returns the letter and does not call Resend", async () => {
  const entry = dailyEntry(WHEN);
  await withEnv(async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_AUDIENCE_ID;
    const res = mockResponse();
    let fetched = false;
    await handleSendDaily(authed("/api/send-daily?dry_run=1&to=person@example.com"), res, {
      now: WHEN,
      fetch: async () => { fetched = true; return jsonResponse({}); }
    });
    assert.equal(fetched, false);
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().status, "dry_run");
    assert.equal(res.json().word, entry.word);
    assert.equal(res.json().subject, SUBJECT);
    assert.equal(res.json().subject.includes(entry.word), false);
    assert.equal(res.json().from, DEFAULT_FROM);
    assert.match(res.json().html, /Find the word\. Face the truth\./);
    assert.equal(res.headers["Cache-Control"], "no-store");
    assert.doesNotMatch(res.text(), /re_test_key|person@example\.com/i);
  });
});

test("the segment send creates one named broadcast and skips a second run", async () => {
  const entry = dailyEntry(WHEN);
  const calls = [];
  await withEnv(async logs => {
    const fetchImpl = async (url, init) => {
      const method = init.method || "POST";
      calls.push({ url: String(url), method, init });
      if (method === "GET" && String(url).includes("/broadcasts?")) {
        return jsonResponse({ object: "list", has_more: false, data: [] });
      }
      if (method === "POST" && String(url) === "https://api.resend.com/broadcasts") {
        return jsonResponse({ id: BROADCAST, object: "broadcast" }, 201);
      }
      if (method === "GET" && String(url) === `https://api.resend.com/broadcasts/${BROADCAST}`) {
        return jsonResponse({ id: BROADCAST, status: "draft", name: broadcastName(WHEN) });
      }
      if (method === "POST" && String(url).endsWith("/send")) {
        return jsonResponse({ id: BROADCAST, object: "broadcast" });
      }
      return jsonResponse({ message: "unexpected" }, 500);
    };
    const res = mockResponse();
    await handleSendDaily(authed("/api/send-daily"), res, { now: WHEN, fetch: fetchImpl });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().status, "sent");
    assert.equal(res.json().broadcast_id, BROADCAST);
    assert.equal(res.json().word, entry.word);
    assert.equal(res.json().date, "2026-10-22");
    assert.doesNotMatch(res.text(), /re_test_key|@/i);

    const created = calls.find(call => call.method === "POST" && call.url === "https://api.resend.com/broadcasts");
    const payload = JSON.parse(created.init.body);
    assert.equal(created.init.headers.Authorization, "Bearer re_test_key");
    assert.equal(created.init.headers["Idempotency-Key"], "daily-letter-2026-10-22");
    assert.equal(payload.segment_id, AUDIENCE);
    assert.equal(payload.name, "daily-letter-2026-10-22");
    assert.equal(payload.subject, SUBJECT);
    assert.equal(payload.from, DEFAULT_FROM);
    assert.equal(payload.send, undefined);
    assert.equal(payload.to, undefined);
    assert.equal(payload.subject.includes(entry.word), false);
    assert.equal(payload.preview_text.includes(entry.word), false);
    assert.equal(payload.html.includes(entry.word), true);
    assert.equal(payload.html.includes(entry.en), true);
    assert.match(payload.html, /Find the word\. Face the truth\./);
    assert.match(payload.html, /https:\/\/devildictionary\.com\/\?word=/);
    assert.match(payload.html, /https:\/\/devildictionary\.com\/daily/);
    const placeholder = new RegExp(UNSUBSCRIBE_PLACEHOLDER.replaceAll("{", "\\{").replaceAll("}", "\\}"));
    assert.match(payload.html, placeholder);
    assert.match(payload.text, placeholder);
    assert.doesNotMatch(JSON.stringify(payload), /person@|subscriber@/i);
    assert.equal(calls.filter(call => call.url.endsWith("/send")).length, 1);
    assert.doesNotMatch(logs.join("\n"), /re_test_key|person@example\.com/i);

    calls.length = 0;
    const again = mockResponse();
    await handleSendDaily(authed("/api/send-daily"), again, {
      now: WHEN,
      fetch: async (url, init) => {
        calls.push({ url: String(url), method: init.method || "POST" });
        return jsonResponse({
          object: "list",
          has_more: false,
          data: [{ id: BROADCAST, name: broadcastName(WHEN), status: "sent" }]
        });
      }
    });
    assert.equal(again.statusCode, 200);
    assert.equal(again.json().status, "already_sent");
    assert.equal(again.json().broadcast_id, BROADCAST);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "GET");
  });
});

test("a draft or failed broadcast is sent, and a canceled one is left alone", async () => {
  await withEnv(async () => {
    for (const status of ["draft", "failed"]) {
      const calls = [];
      const res = mockResponse();
      await handleSendDaily(authed("/api/send-daily"), res, {
        now: WHEN,
        fetch: async (url, init) => {
          const method = init.method || "POST";
          calls.push({ url: String(url), method });
          if (method === "GET") {
            return jsonResponse({
              object: "list",
              has_more: false,
              data: [{ id: BROADCAST, name: broadcastName(WHEN), status }]
            });
          }
          return jsonResponse({ id: BROADCAST });
        }
      });
      assert.equal(res.json().status, "sent", status);
      assert.deepEqual(calls.map(call => call.method), ["GET", "POST"]);
      assert.match(calls[1].url, /\/broadcasts\/559ac32e-9ef5-46fb-82a1-b76b840c0f7b\/send$/);
    }

    const canceledCalls = [];
    const canceled = mockResponse();
    await handleSendDaily(authed("/api/send-daily"), canceled, {
      now: WHEN,
      fetch: async (url, init) => {
        canceledCalls.push(init.method || "POST");
        return jsonResponse({
          object: "list",
          has_more: false,
          data: [{ id: BROADCAST, name: broadcastName(WHEN), status: "canceled" }]
        });
      }
    });
    assert.equal(canceled.json().status, "already_sent");
    assert.deepEqual(canceledCalls, ["GET"]);
  });
});

test("a proof send goes to one address and does not mark the day", async () => {
  const calls = [];
  await withEnv(async logs => {
    const res = mockResponse();
    await handleSendDaily(authed("/api/send-daily?to=Person@Example.com"), res, {
      now: WHEN,
      fetch: async (url, init) => {
        calls.push({ url: String(url), method: init.method || "POST", init });
        return jsonResponse({ id: "4ef9a417-02e9-4d39-ad75-9611e0fcc33c" });
      }
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().status, "test_sent");
    assert.equal(res.json().email_id, "4ef9a417-02e9-4d39-ad75-9611e0fcc33c");
    assert.doesNotMatch(res.text(), /person@example\.com/i);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.resend.com/emails");
    const payload = JSON.parse(calls[0].init.body);
    assert.deepEqual(payload.to, ["person@example.com"]);
    assert.equal(payload.headers["List-Unsubscribe"], `<${TEST_UNSUBSCRIBE}>`);
    assert.match(payload.html, /mailto:support@devildictionary\.com/);
    assert.doesNotMatch(payload.html, /RESEND_UNSUBSCRIBE_URL/);
    assert.equal(payload.segment_id, undefined);
    assert.doesNotMatch(logs.join("\n"), /person@example\.com|re_test_key/i);

    const invalid = mockResponse();
    let fetched = false;
    await handleSendDaily(authed("/api/send-daily?to=not-an-email"), invalid, {
      now: WHEN,
      fetch: async () => { fetched = true; return jsonResponse({}); }
    });
    assert.equal(invalid.statusCode, 400);
    assert.equal(invalid.json().status, "invalid_email");
    assert.equal(fetched, false);
  });
});

test("a segment send refuses to run until Resend is configured", async () => {
  await withEnv(async () => {
    delete process.env.RESEND_API_KEY;
    const missing = mockResponse();
    let fetched = false;
    await handleSendDaily(authed("/api/send-daily"), missing, {
      now: WHEN,
      fetch: async () => { fetched = true; return jsonResponse({}); }
    });
    assert.equal(missing.statusCode, 503);
    assert.equal(missing.json().status, "not_configured");
    assert.equal(fetched, false);

    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "not-a-sender";
    const badFrom = mockResponse();
    await handleSendDaily(authed("/api/send-daily"), badFrom, {
      now: WHEN,
      fetch: async () => { fetched = true; return jsonResponse({}); }
    });
    assert.equal(badFrom.statusCode, 503);
    assert.equal(fetched, false);

    process.env.RESEND_FROM = "Dictionary <letter@devildictionary.com>";
    const calls = [];
    const custom = mockResponse();
    await handleSendDaily(authed("/api/send-daily"), custom, {
      now: WHEN,
      fetch: async (url, init) => {
        calls.push({ url: String(url), method: init.method || "POST", body: init.body });
        if ((init.method || "POST") === "GET") return jsonResponse({ object: "list", has_more: false, data: [] });
        if (String(url).endsWith("/broadcasts")) return jsonResponse({ id: BROADCAST }, 201);
        if (String(url).endsWith(BROADCAST)) return jsonResponse({ id: BROADCAST, status: "draft" });
        return jsonResponse({ id: BROADCAST });
      }
    });
    assert.equal(custom.json().status, "sent");
    const created = calls.find(call => call.method === "POST" && call.url.endsWith("/broadcasts"));
    assert.equal(JSON.parse(created.body).from, "Dictionary <letter@devildictionary.com>");
  });
});

test("vercel.json runs the letter once a day at 15:00 UTC", () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  const cron = config.crons.find(item => item.path === "/api/send-daily");
  assert.ok(cron);
  assert.equal(cron.schedule, "0 15 * * *");
});
