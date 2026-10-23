// Daily-word list via Resend.
// November 2025: Audiences became Segments. POST /audiences/{id}/contacts
// is no longer documented. Create Contact is POST /contacts, and
// RESEND_AUDIENCE_ID is the segment id of that list.
// https://resend.com/docs/api-reference/contacts/create-contact
// A duplicate contact is still a successful subscribe: opt them back in
// and add them to the segment. Never log the address or the API key.

const AUDIENCE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const ON_THE_LIST = "You’re on the list for the day’s word.";
const NOT_CONFIGURED = "The daily-word list is not configured yet. This address was not saved.";
const NOT_SAVED = "This address was not saved.";

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

function configured() {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const audienceId = String(process.env.RESEND_AUDIENCE_ID || "").trim();
  if (!apiKey || /\s/.test(apiKey) || !AUDIENCE_ID.test(audienceId)) return null;
  return { apiKey, audienceId };
}

function readBody(req) {
  if (req?.body != null && typeof req.body !== "function") {
    if (typeof req.body === "string" || Buffer.isBuffer(req.body)) return Promise.resolve(String(req.body));
    if (typeof req.body === "object") return Promise.resolve(req.body);
  }
  if (!req || typeof req.on !== "function") return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve(value);
    };
    req.on("data", chunk => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      size += buf.length;
      if (size > 4096) {
        const error = new Error("too_large");
        error.code = "too_large";
        finish(error);
        return;
      }
      chunks.push(buf);
    });
    req.on("end", () => finish(null, Buffer.concat(chunks).toString("utf8")));
    req.on("error", finish);
  });
}

function emailFrom(raw, contentType) {
  if (raw && typeof raw === "object") return String(raw.email ?? "");
  const text = String(raw ?? "");
  const type = String(contentType || "").toLowerCase();
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (type.includes("application/json") || trimmed.startsWith("{")) {
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      const error = new Error("invalid_json");
      error.code = "invalid_json";
      throw error;
    }
    if (!parsed || typeof parsed !== "object") return "";
    return String(parsed.email ?? "");
  }
  return new URLSearchParams(text).get("email") || "";
}

function validEmail(email) {
  return email.length <= 254 && EMAIL.test(email);
}

async function resend(apiKey, url, init) {
  const response = await fetch(url, {
    ...init,
    method: init.method || "POST",
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...init.headers
    }
  });
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

function alreadyExists(result) {
  if (result.status === 409) return true;
  const detail = `${result.body?.message || ""} ${result.body?.name || ""}`.toLowerCase();
  return /already exists|duplicate/.test(detail);
}

export default async function handler(req, res) {
  const method = req?.method || "GET";
  if (method !== "POST") {
    send(res, 405, {
      ok: false,
      status: "method_not_allowed",
      message: `Send a POST. ${NOT_SAVED}`
    }, { Allow: "POST" });
    return;
  }

  const settings = configured();
  let raw = "";
  try {
    raw = await readBody(req);
  } catch {
    send(res, 400, {
      ok: false,
      status: "invalid_email",
      message: `Enter a valid email address. ${NOT_SAVED}`
    });
    return;
  }

  if (!settings) {
    send(res, 503, {
      ok: false,
      status: "not_configured",
      message: NOT_CONFIGURED
    });
    return;
  }

  let email = "";
  try {
    email = emailFrom(raw, req?.headers?.["content-type"] || req?.headers?.["Content-Type"]).trim().toLowerCase();
  } catch {
    send(res, 400, {
      ok: false,
      status: "invalid_email",
      message: `Enter a valid email address. ${NOT_SAVED}`
    });
    return;
  }
  if (!validEmail(email)) {
    send(res, 400, {
      ok: false,
      status: "invalid_email",
      message: `Enter a valid email address. ${NOT_SAVED}`
    });
    return;
  }

  const contact = encodeURIComponent(email);
  const segment = encodeURIComponent(settings.audienceId);
  try {
    const created = await resend(settings.apiKey, "https://api.resend.com/contacts", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        unsubscribed: false,
        segments: [{ id: settings.audienceId }]
      })
    });
    if (!created.ok && !alreadyExists(created)) {
      send(res, 502, {
        ok: false,
        status: "upstream_error",
        message: `The list could not be reached. ${NOT_SAVED}`
      });
      return;
    }
    if (alreadyExists(created)) {
      const optedIn = await resend(settings.apiKey, `https://api.resend.com/contacts/${contact}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unsubscribed: false })
      });
      const joined = await resend(settings.apiKey, `https://api.resend.com/contacts/${contact}/segments/${segment}`, {
        headers: { "Content-Type": "application/json" },
        body: "{}"
      });
      if ((!optedIn.ok && !alreadyExists(optedIn)) || (!joined.ok && !alreadyExists(joined))) {
        send(res, 502, {
          ok: false,
          status: "upstream_error",
          message: `The list could not be reached. ${NOT_SAVED}`
        });
        return;
      }
    }
  } catch {
    send(res, 502, {
      ok: false,
      status: "upstream_error",
      message: `The list could not be reached. ${NOT_SAVED}`
    });
    return;
  }

  send(res, 200, {
    ok: true,
    status: "subscribed",
    message: ON_THE_LIST
  });
}
