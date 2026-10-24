// Morning letter for the Resend segment in RESEND_AUDIENCE_ID.
//
// Schedule (vercel.json): `0 15 * * *`.
// Vercel cron expressions are UTC and do not follow daylight saving.
// 15:00 UTC is 08:00 Pacific Daylight Time and 07:00 Pacific Standard Time.
// America/Los_Angeles is the chosen morning: summer readers get 8:00am PT,
// winter readers get 7:00am PT. The word itself is still the UTC day used
// by /daily (days since 2026-01-01), so the letter and the site agree.
//
// Auth: the current Vercel recommendation is an environment variable named
// CRON_SECRET. When it is set, Vercel invokes the cron path with
// `Authorization: Bearer <CRON_SECRET>`. Compare that header to the env
// value. `x-vercel-cron`, `x-vercel-cron-schedule`, and a User-Agent of
// `vercel-cron/1.0` are not secrets and are ignored.
//
// Send path: Resend Broadcasts, POST /broadcasts with segment_id, then
// POST /broadcasts/:id/send. A broadcast goes to subscribed contacts in
// the segment; unsubscribed contacts are left out by Resend. This route
// does not list contact addresses.
//
// Idempotency: there is no Vercel KV in this project. Resend documents
// Idempotency-Key for the Emails API, not for Broadcasts. The durable
// marker is a broadcast named `daily-letter-YYYY-MM-DD` (UTC date, the
// same calendar as dailyEntry). Before creating one, the route lists
// broadcasts and skips the day when that name is already sent, queued,
// scheduled, canceled, or any status other than draft/failed. A draft or
// failed copy is sent instead of creating another. The create and send
// requests also carry `Idempotency-Key: daily-letter-YYYY-MM-DD` so a
// gateway that honors the header collapses a retry. A `?to=` proof send
// does not create that marker and may be repeated.
//
// Never log an address or the API key.

import { timingSafeEqual } from "node:crypto";
import { dailyEntry } from "../lib/landing.mjs";
import {
  TEST_UNSUBSCRIBE,
  UNSUBSCRIBE_PLACEHOLDER,
  buildLetter,
  senderFrom,
  validEmail
} from "../lib/daily-letter.mjs";

const AUDIENCE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUPPORT = "support@devildictionary.com";

function send(res, statusCode, payload, extraHeaders) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) res.setHeader(key, value);
  }
  res.end(JSON.stringify(payload));
}

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") {
    const fromGet = headers.get(name);
    if (fromGet) return String(fromGet);
  }
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

function authorized(req) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret || /\s/.test(secret)) return false;
  return safeEqual(headerValue(req, "authorization"), `Bearer ${secret}`);
}

function requestUrl(req) {
  const url = new URL(String(req?.url || "/api/send-daily"), "https://devildictionary.com");
  const query = req?.query;
  if (query && typeof query === "object") {
    for (const [key, value] of Object.entries(query)) {
      if (value == null || url.searchParams.has(key)) continue;
      url.searchParams.set(key, Array.isArray(value) ? String(value[0]) : String(value));
    }
  }
  return url;
}

function readSettings() {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const audienceId = String(process.env.RESEND_AUDIENCE_ID || "").trim();
  const from = senderFrom(process.env.RESEND_FROM);
  return {
    apiKey,
    audienceId,
    from,
    keyOk: Boolean(apiKey) && !/\s/.test(apiKey),
    audienceOk: AUDIENCE_ID.test(audienceId),
    fromOk: Boolean(from)
  };
}

async function resend(apiKey, url, init, fetchImpl) {
  const response = await fetchImpl(url, {
    ...init,
    method: init.method || "POST",
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers || {})
    }
  });
  if (response.status >= 300 && response.status < 400) {
    return { status: response.status, ok: false, body: {} };
  }
  const text = await response.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = {};
    }
  }
  return { status: response.status, ok: response.ok, body };
}

function sendable(status) {
  const value = String(status || "").toLowerCase();
  return value === "draft" || value === "failed";
}

async function listNamed(apiKey, name, fetchImpl) {
  const found = [];
  let after = "";
  for (let page = 0; page < 20; page += 1) {
    const url = new URL("https://api.resend.com/broadcasts");
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);
    const result = await resend(apiKey, url, { method: "GET" }, fetchImpl);
    if (!result.ok) return { error: result, found };
    const data = Array.isArray(result.body?.data) ? result.body.data : [];
    for (const item of data) {
      if (item && item.name === name) found.push(item);
    }
    if (found.length || !result.body?.has_more || data.length === 0) return { found };
    const next = String(data[data.length - 1]?.id || "");
    if (!next || next === after) return { found, incomplete: true };
    after = next;
  }
  return { found, incomplete: found.length === 0 };
}

function upstream(res, step, status) {
  const payload = { ok: false, status: "upstream_error", step };
  if (Number.isInteger(status)) payload.upstream_status = status;
  send(res, 502, payload);
}

export async function handleSendDaily(req, res, options = {}) {
  const method = String(req?.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "POST") {
    send(res, 405, { ok: false, status: "method_not_allowed" }, { Allow: "GET, POST" });
    return;
  }
  if (!authorized(req)) {
    send(res, 401, { ok: false, status: "unauthorized" });
    return;
  }

  const now = options.now instanceof Date ? options.now : new Date();
  const fetchImpl = options.fetch || globalThis.fetch;
  const url = requestUrl(req);
  const dryRun = url.searchParams.get("dry_run") === "1" || url.searchParams.get("dry_run") === "true";
  const to = String(url.searchParams.get("to") || "").trim().toLowerCase();
  const entry = dailyEntry(now);
  const settings = readSettings();

  if (dryRun) {
    const letter = buildLetter(entry, now);
    send(res, 200, {
      ok: true,
      status: "dry_run",
      date: letter.date,
      word: letter.word,
      subject: letter.subject,
      preview: letter.preview,
      from: settings.from,
      html: letter.html,
      text: letter.text
    });
    return;
  }

  if (to) {
    if (!validEmail(to)) {
      send(res, 400, { ok: false, status: "invalid_email" });
      return;
    }
    if (!settings.keyOk || !settings.fromOk) {
      send(res, 503, { ok: false, status: "not_configured" });
      return;
    }
    const letter = buildLetter(entry, now, { unsubscribeUrl: TEST_UNSUBSCRIBE });
    try {
      const sent = await resend(settings.apiKey, "https://api.resend.com/emails", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: settings.from,
          to: [to],
          subject: letter.subject,
          html: letter.html,
          text: letter.text,
          reply_to: [SUPPORT],
          headers: { "List-Unsubscribe": `<${TEST_UNSUBSCRIBE}>` }
        })
      }, fetchImpl);
      if (!sent.ok) {
        upstream(res, "test_send", sent.status);
        return;
      }
      send(res, 200, {
        ok: true,
        status: "test_sent",
        date: letter.date,
        word: letter.word,
        email_id: sent.body?.id || null
      });
    } catch {
      upstream(res, "test_send");
    }
    return;
  }

  if (!settings.keyOk || !settings.audienceOk || !settings.fromOk) {
    send(res, 503, { ok: false, status: "not_configured" });
    return;
  }

  const letter = buildLetter(entry, now, { unsubscribeUrl: UNSUBSCRIBE_PLACEHOLDER });
  const idempotencyKey = letter.name;
  try {
    const listed = await listNamed(settings.apiKey, letter.name, fetchImpl);
    if (listed.error) {
      upstream(res, "list_broadcasts", listed.error.status);
      return;
    }
    if (listed.incomplete) {
      send(res, 502, { ok: false, status: "lookup_incomplete", step: "list_broadcasts" });
      return;
    }
    const handled = listed.found.find(item => item?.id && !sendable(item.status));
    if (handled) {
      send(res, 200, {
        ok: true,
        status: "already_sent",
        date: letter.date,
        word: letter.word,
        broadcast_id: handled.id
      });
      return;
    }
    let broadcastId = listed.found.find(item => item?.id && sendable(item.status))?.id || "";
    if (!broadcastId) {
      const created = await resend(settings.apiKey, "https://api.resend.com/broadcasts", {
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          name: letter.name,
          segment_id: settings.audienceId,
          from: settings.from,
          subject: letter.subject,
          preview_text: letter.preview,
          html: letter.html,
          text: letter.text,
          reply_to: [SUPPORT]
        })
      }, fetchImpl);
      if (!created.ok) {
        upstream(res, "create_broadcast", created.status);
        return;
      }
      broadcastId = String(created.body?.id || "");
      if (!broadcastId) {
        upstream(res, "create_broadcast", created.status);
        return;
      }
      const detail = await resend(settings.apiKey, `https://api.resend.com/broadcasts/${encodeURIComponent(broadcastId)}`, {
        method: "GET"
      }, fetchImpl);
      if (detail.ok && detail.body?.status && !sendable(detail.body.status)) {
        send(res, 200, {
          ok: true,
          status: "already_sent",
          date: letter.date,
          word: letter.word,
          broadcast_id: broadcastId
        });
        return;
      }
    }
    const sent = await resend(settings.apiKey, `https://api.resend.com/broadcasts/${encodeURIComponent(broadcastId)}/send`, {
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `${idempotencyKey}-send`
      },
      body: "{}"
    }, fetchImpl);
    if (!sent.ok) {
      upstream(res, "send_broadcast", sent.status);
      return;
    }
    send(res, 200, {
      ok: true,
      status: "sent",
      date: letter.date,
      word: letter.word,
      broadcast_id: sent.body?.id || broadcastId
    });
  } catch {
    upstream(res, "send_broadcast");
  }
}

export default function handler(req, res) {
  return handleSendDaily(req, res);
}
