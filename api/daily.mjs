import { dailyEntry, renderDailyHtml } from "../lib/landing.mjs";

export default function handler(_req, res) {
  const now = new Date();
  const entry = dailyEntry(now);
  const nextUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const seconds = Math.max(60, Math.min(3600, Math.floor((nextUtcMidnight - now.getTime()) / 1000)));
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", `public, max-age=${seconds}`);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(renderDailyHtml(entry, now));
}
