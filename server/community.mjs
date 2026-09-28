import {
  randomUUID,
  randomBytes,
  createHmac,
  timingSafeEqual,
  scryptSync,
} from "node:crypto";
import { database } from "./db.mjs";
const now = () => Math.floor(Date.now() / 1000);
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const safe = (a, b) => {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const secret = () => {
  if ((process.env.COMMUNITY_SESSION_SECRET || "").length < 32)
    fail(503, "Community service is not configured.");
  return process.env.COMMUNITY_SESSION_SECRET;
};
const sign = (x) => createHmac("sha256", secret()).update(x).digest("hex");
const fields = "id,word,pos,definition,author,created";
function text(value, max, min = 1) {
  if (typeof value !== "string")
    fail(400, "Please complete every required field.");
  const s = value.trim();
  if (
    s.length < min ||
    s.length > max ||
    /[\u0000-\u0008\u000b-\u001f]/.test(s)
  )
    fail(400, "Please check the field lengths.");
  return s;
}
export function validate(body) {
  const word = text(body.word, 10, 3).toUpperCase();
  if (!/^[A-Z]+$/.test(word))
    fail(400, "Use one word, with 3–10 English letters.");
  if (!["noun", "verb", "adjective", "adverb"].includes(body.pos))
    fail(400, "Choose a part of speech.");
  if (body.consent !== true)
    fail(400, "Please confirm permission to publish your work.");
  return {
    word,
    pos: body.pos,
    definition: text(body.definition, 240, 10),
    author: text(body.author || "Anonymous", 40),
  };
}
async function limit(db, ip, bucket, max) {
  const tick = Math.floor(now() / 3600);
  const key = sign(`${ip}:${bucket}:${tick}`);
  const rows = await db.query(
    "INSERT INTO community_limits(key,count,expires) VALUES($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=community_limits.count+1 RETURNING count",
    [key, (tick + 1) * 3600],
  );
  await db.query("DELETE FROM community_limits WHERE expires < $1", [now()]);
  if (rows[0].count > max)
    fail(429, "Too many attempts. Please try again in an hour.");
}
function sessionToken(req) {
  return (
    (req.headers.cookie || "")
      .split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith("devil_editor="))
      ?.slice(13) || ""
  );
}
async function admin(req, db) {
  const token = sessionToken(req);
  if (!/^[a-f0-9]{64}$/.test(token))
    fail(401, "Please sign in to the editor’s desk.");
  const rows = await db.query(
    "SELECT token FROM community_sessions WHERE token=$1 AND expires>$2",
    [sign(token), now()],
  );
  if (!rows.length) fail(401, "Please sign in to the editor’s desk.");
}
export async function handle(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const reply = (status, data) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  try {
    const url = new URL(req.url, "http://localhost");
    const action = url.searchParams.get("action") || "entries";
    if (!["GET", "POST"].includes(req.method)) fail(405, "Method not allowed.");
    if (req.method === "POST") {
      const origin = process.env.COMMUNITY_ORIGIN;
      if (!origin || (req.headers.origin !== origin && req.headers.origin !== (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : origin)))
        fail(403, "Please submit from this website.");
      if (!(req.headers["content-type"] || "").startsWith("application/json"))
        fail(415, "JSON required.");
    }
    const db = await database();
    await db.query("DELETE FROM community_sessions WHERE expires < $1", [
      now(),
    ]);
    await db.query(
      "DELETE FROM community_entries WHERE (status='pending' AND created < $1) OR (status IN ('rejected','removed') AND updated < $2)",
      [now() - 90 * 86400, now() - 30 * 86400],
    );
    await db.query(
      "DELETE FROM community_reports WHERE status='resolved' AND created < $1",
      [now() - 30 * 86400],
    );
    const ip = process.env.VERCEL
      ? req.headers["x-vercel-forwarded-for"]
      : req.socket?.remoteAddress;
    if (!ip) fail(503, "Unable to validate this request.");
    let body = req.body;
    if (req.method === "POST" && !body) {
      let raw = "";
      for await (const part of req) {
        raw += part;
        if (Buffer.byteLength(raw) > 4096) fail(413, "Submission too large.");
      }
      try {
        body = JSON.parse(raw);
      } catch {
        fail(400, "Invalid submission.");
      }
    }
    if (
      req.method === "POST" &&
      (typeof body !== "object" ||
        !body ||
        Array.isArray(body) ||
        Buffer.byteLength(JSON.stringify(body)) > 4096)
    )
      fail(400, "Invalid submission.");
    if (action === "entries" && req.method === "GET") {
      const id = url.searchParams.get("id");
      const page = Math.max(
        0,
        Math.min(10000, Number(url.searchParams.get("page")) || 0),
      );
      const rows = id
        ? await db.query(
            `SELECT ${fields} FROM community_entries WHERE status='approved' AND id=$1`,
            [id],
          )
        : await db.query(
            `SELECT ${fields} FROM community_entries WHERE status='approved' ORDER BY created DESC,id LIMIT 21 OFFSET $1`,
            [Math.floor(page) * 20],
          );
      if (id && !rows.length) fail(404, "This entry is not available.");
      return reply(200, {
        entries: rows.slice(0, 20),
        hasMore: rows.length > 20,
      });
    }
    if (action === "submit" && req.method === "POST") {
      await limit(db, ip, "submit", 5);
      if (body.website) fail(400, "Unable to accept this submission.");
      const entry = validate(body);
      const id = randomUUID();
      await db.query(
        "INSERT INTO community_entries(id,word,pos,definition,author,status,created,updated,consent) VALUES($1,$2,$3,$4,$5,$6,$7,$7,$8)",
        [
          id,
          entry.word,
          entry.pos,
          entry.definition,
          entry.author,
          "pending",
          now(),
          "community-v1",
        ],
      );
      return reply(201, {
        id,
        message:
          "Submitted to the editor. Your entry stays private until approved.",
      });
    }
    if (action === "login" && req.method === "POST") {
      await limit(db, ip, "login", 8);
      const [salt, hash] = (process.env.COMMUNITY_ADMIN_HASH || "").split(":");
      if (!salt || !hash) fail(503, "Editor sign-in is not configured.");
      const password = text(body.password, 200);
      const candidate = scryptSync(password, salt, 64).toString("hex");
      if (!safe(candidate, hash)) fail(401, "Incorrect password.");
      const token = randomBytes(32).toString("hex");
      await db.query(
        "INSERT INTO community_sessions(token,expires) VALUES($1,$2)",
        [sign(token), now() + 3600],
      );
      res.setHeader(
        "Set-Cookie",
        `devil_editor=${token}; HttpOnly; SameSite=Strict; Path=/api/community; Max-Age=3600${process.env.COMMUNITY_LOCAL === "1" && !process.env.VERCEL ? "" : "; Secure"}`,
      );
      return reply(200, { ok: true });
    }
    if (action === "logout" && req.method === "POST") {
      await db.query("DELETE FROM community_sessions WHERE token=$1", [
        sign(sessionToken(req)),
      ]);
      res.setHeader(
        "Set-Cookie",
        "devil_editor=; HttpOnly; SameSite=Strict; Path=/api/community; Max-Age=0",
      );
      return reply(200, { ok: true });
    }
    if (action === "report" && req.method === "POST") {
      await limit(db, ip, "report", 5);
      const id = text(body.id, 40);
      const rows = await db.query(
        "SELECT id FROM community_entries WHERE id=$1 AND status='approved'",
        [id],
      );
      if (!rows.length) fail(404, "Entry not found.");
      await db.query(
        "INSERT INTO community_reports(id,entry_id,reason,created) VALUES($1,$2,$3,$4)",
        [randomUUID(), id, text(body.reason, 500, 5), now()],
      );
      return reply(201, {
        message: "Report received. The editor will review it.",
      });
    }
    await admin(req, db);
    if (action === "desk" && req.method === "GET") {
      const status = url.searchParams.get("status") || "pending";
      if (!["pending", "approved", "rejected", "removed"].includes(status))
        fail(400, "Invalid status.");
      const page = Math.max(
        0,
        Math.floor(Number(url.searchParams.get("page")) || 0),
      );
      return reply(200, {
        entries: await db.query(
          "SELECT * FROM community_entries WHERE status=$1 ORDER BY created DESC,id LIMIT 21 OFFSET $2",
          [status, page * 20],
        ),
        reports: await db.query(
          "SELECT r.*,e.word FROM community_reports r LEFT JOIN community_entries e ON e.id=r.entry_id WHERE r.status='open' ORDER BY r.created LIMIT 100",
        ),
      });
    }
    if (action === "moderate" && req.method === "POST") {
      if (!["approved", "rejected", "removed"].includes(body.status))
        fail(400, "Invalid decision.");
      const from = body.status === "removed" ? "approved" : "pending";
      const rows = await db.query(
        "UPDATE community_entries SET status=$1,updated=$2 WHERE id=$3 AND status=$4 RETURNING id",
        [body.status, now(), text(body.id, 40), from],
      );
      if (!rows.length) fail(409, "Entry changed. Refresh the desk.");
      return reply(200, { ok: true });
    }
    if (action === "resolve" && req.method === "POST") {
      await db.query(
        "UPDATE community_reports SET status='resolved',created=$2 WHERE id=$1",
        [text(body.id, 40), now()],
      );
      return reply(200, { ok: true });
    }
    fail(404, "Not found.");
  } catch (error) {
    reply(error.status || 503, {
      error: error.status
        ? error.message
        : "The community service is temporarily unavailable. Your action was not confirmed. Please retry.",
    });
  }
}
