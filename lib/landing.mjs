/**
 * Shared dictionary landing pages: /daily (rendered per request) and /word/<slug>.
 * Entries stay in app.js so the game and these pages cannot drift.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SITE = "https://devildictionary.com";
export const SLOGAN = "Find the word. Face the truth.";
const EPOCH_UTC = Date.UTC(2026, 0, 1);

export const SOCIAL_LINKS = [
  { href: "https://x.com/intent/follow?screen_name=Lakesideobhj", label: "Follow on X", rel: "noopener noreferrer" },
  { href: "https://x.com/Lakesideobhj", label: "Visit @Lakesideobhj", rel: "me noopener noreferrer" },
  { href: "https://www.youtube.com/@DevilsDictionary", label: "Follow on YouTube", rel: "me noopener noreferrer" },
  { href: "https://www.youtube.com/@DevilsDictionary", label: "Visit Devil’s Dictionary", rel: "noopener noreferrer" },
  { href: "https://www.instagram.com/lakesideharb/", label: "Follow on Instagram", rel: "me noopener noreferrer" },
  { href: "https://www.instagram.com/lakesideharb/", label: "Visit @lakesideharb", rel: "noopener noreferrer" }
];

let cached;

export function loadEntries() {
  if (cached) return cached;
  const src = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const marker = "const ENTRIES = ";
  const start = src.indexOf(marker);
  if (start < 0) throw new Error("ENTRIES not found in app.js");
  let i = start + marker.length;
  while (src[i] !== "[") i += 1;
  let depth = 0;
  let quote = null;
  let escape = false;
  for (let j = i; j < src.length; j += 1) {
    const c = src[j];
    if (quote) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "\"" || c === "'") {
      quote = c;
      continue;
    }
    if (c === "[") depth += 1;
    else if (c === "]") {
      depth -= 1;
      if (depth === 0) {
        cached = Function(`"use strict"; return (${src.slice(i, j + 1)});`)();
        return cached;
      }
    }
  }
  throw new Error("unterminated ENTRIES");
}

export function slugFor(word) {
  return String(word).toLowerCase();
}

export function entryBySlug(slug) {
  const key = String(slug || "").toLowerCase();
  return loadEntries().find(entry => slugFor(entry.word) === key) || null;
}

export function dailyEntry(date = new Date()) {
  const entries = loadEntries();
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const days = Math.floor((utc - EPOCH_UTC) / 86400000);
  const index = ((days % entries.length) + entries.length) % entries.length;
  return entries[index];
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function xIntentUrl(text) {
  const url = new URL("https://x.com/intent/post");
  url.searchParams.set("text", text);
  url.searchParams.set("via", "Lakesideobhj");
  url.searchParams.set("utm_source", "x");
  url.searchParams.set("utm_medium", "share");
  url.searchParams.set("utm_campaign", "game");
  return url.toString();
}

export function wordShareText(entry, pageUrl) {
  return `${entry.word}, ${entry.pos}\n\n${entry.en}\n\n${SLOGAN}\n${pageUrl}`;
}

export function socialLinksHtml(className = "social-links") {
  const links = SOCIAL_LINKS.map(item =>
    `<a href="${item.href}" target="_blank" rel="${item.rel}">${item.label}</a>`
  ).join("");
  return `<nav class="${className}" aria-label="Follow The Devil’s Dictionary">${links}</nav>`;
}

function formatUtcDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function pageShell({ title, description, canonical, image, imageAlt, body, robots = "index, follow" }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#17120e" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon.png" type="image/png" sizes="64x64" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="The Devil's Dictionary" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@Lakesideobhj" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <script>
      if (!window.Capacitor && location.hostname === "www.devildictionary.com") {
        location.replace("https://devildictionary.com" + location.pathname + location.search + location.hash);
      }
    </script>
    <link rel="stylesheet" href="/landing.css" />
  </head>
  <body>
    <main>
      ${body}
    </main>
    <script src="/analytics.js"></script>
  </body>
</html>
`;
}

function devilPicture() {
  return `<picture>
        <source srcset="/assets/devil-engraving.avif" type="image/avif" />
        <source srcset="/assets/devil-engraving.webp" type="image/webp" />
        <img src="/assets/devil-engraving.png" width="160" height="80" alt="" decoding="async" />
      </picture>`;
}

function subscribeFormHtml(id) {
  return `<form class="subscribe" data-subscribe action="/api/subscribe" method="post">
        <p class="subscribe-kicker">Daily word</p>
        <label for="${id}">Email for the day’s word</label>
        <div class="subscribe-row">
          <input id="${id}" name="email" type="email" inputmode="email" autocomplete="email" required maxlength="254" placeholder="you@example.com" />
          <button type="submit">Request the list</button>
        </div>
        <p class="subscribe-status" data-subscribe-status role="status">The list is not open yet. Nothing you type is saved.</p>
        <p class="subscribe-note"><a href="/privacy">Privacy</a></p>
      </form>`;
}

function entryBody(entry, { kicker, extra, sharePlace }) {
  const slug = slugFor(entry.word);
  const pageUrl = `${SITE}/word/${slug}?utm_source=x&utm_medium=share&utm_campaign=game`;
  const intent = xIntentUrl(wordShareText(entry, pageUrl));
  const place = sharePlace === "daily" ? "daily" : "word";
  return `
      <p class="home-link"><a href="/">← The Devil’s Dictionary</a></p>
      ${devilPicture()}
      <p class="kicker">${escapeHtml(kicker)}</p>
      <h1>${escapeHtml(entry.word)}</h1>
      <p class="pos">${escapeHtml(entry.pos)}</p>
      <blockquote>${escapeHtml(entry.en)}</blockquote>
      <p class="slogan">${SLOGAN}</p>
      <div class="actions">
        <a class="primary" href="/?word=${encodeURIComponent(entry.word)}">Play this word</a>
        <a href="${intent}" data-track="share" data-share-method="x" data-share-place="${place}" target="_blank" rel="noopener noreferrer">Share on X</a>
        <a href="/">Play the full game</a>
      </div>
      ${extra || ""}
      ${socialLinksHtml()}
      <nav class="more" aria-label="Elsewhere">
        <a href="/daily">Today’s word</a>
        <a href="/community">Community</a>
        <a href="/print-play">Printable cards</a>
      </nav>`;
}

export function renderWordHtml(entry) {
  const slug = slugFor(entry.word);
  const title = `${entry.word} — The Devil’s Dictionary`;
  const description = `${entry.word}, ${entry.pos}. ${entry.en} ${SLOGAN}`;
  return pageShell({
    title,
    description,
    canonical: `${SITE}/word/${slug}`,
    image: `${SITE}/og/${slug}.jpg`,
    imageAlt: `${entry.word}: ${entry.en}`,
    body: entryBody(entry, {
      kicker: "A dictionary entry",
      sharePlace: "word",
      extra: `<p class="note"><a href="/daily">See the word the dictionary is circulating today.</a></p>`
    })
  });
}

export function renderDailyHtml(entry, date = new Date()) {
  const slug = slugFor(entry.word);
  const when = formatUtcDate(date);
  const title = `Today’s word: ${entry.word} — The Devil’s Dictionary`;
  const description = `${when} (UTC). ${entry.word}, ${entry.pos}. ${entry.en} ${SLOGAN}`;
  return pageShell({
    title,
    description,
    canonical: `${SITE}/daily`,
    image: `${SITE}/og/${slug}.jpg`,
    imageAlt: `Today’s word, ${entry.word}: ${entry.en}`,
    body: entryBody(entry, {
      kicker: `Today’s word · ${when} UTC`,
      sharePlace: "daily",
      extra: `<p class="note">Permanent card for this entry: <a href="/word/${slug}">/word/${slug}</a>. Link that address from a daily video so each day has its own preview.</p>
      ${subscribeFormHtml("daily-email")}`
    })
  });
}

export function renderNotFoundHtml() {
  return pageShell({
    title: "Page not found — The Devil’s Dictionary",
    description: "That page is not in this edition of The Devil’s Dictionary.",
    canonical: `${SITE}/`,
    image: `${SITE}/og.png`,
    imageAlt: "The Devil's Dictionary",
    robots: "noindex",
    body: `
      <p class="home-link"><a href="/">← The Devil’s Dictionary</a></p>
      ${devilPicture()}
      <p class="kicker">404</p>
      <h1>This page left the dictionary.</h1>
      <p class="slogan">${SLOGAN}</p>
      <p class="note">The entry you asked for is not bound in this edition.</p>
      <div class="actions">
        <a class="primary" href="/">Back to the game</a>
        <a href="/daily">Today’s word</a>
        <a href="/community">Community</a>
      </div>
      ${socialLinksHtml()}`
  });
}
