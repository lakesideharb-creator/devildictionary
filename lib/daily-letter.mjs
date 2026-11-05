/**
 * The morning letter. Pure builders: no network, no secrets.
 * The subject teases. The body reveals the word and definition so the
 * letter is still worth opening if the reader never visits the grid.
 */
import { SITE, SLOGAN, escapeHtml } from "./landing.mjs";

export const SUBJECT = "Today’s word awaits";
export const PREVIEW = "The dictionary has chosen. The definition is inside; the grid can wait.";
export const DEFAULT_FROM = "The Devil’s Dictionary <daily@devildictionary.com>";
export const UNSUBSCRIBE_PLACEHOLDER = "{{{RESEND_UNSUBSCRIBE_URL}}}";
export const TEST_UNSUBSCRIBE = "mailto:support@devildictionary.com?subject=Unsubscribe%20the%20daily%20letter";

const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function utcDateKey(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function broadcastName(date) {
  return `daily-letter-${utcDateKey(date)}`;
}

export function senderFrom(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return DEFAULT_FROM;
  return acceptableFrom(value) ? value : "";
}

export function acceptableFrom(value) {
  if (value.length > 320 || /[\r\n]/.test(value)) return false;
  const wrapped = value.match(/^(.*)<([^<>]+)>\s*$/);
  const address = (wrapped ? wrapped[2] : value).trim();
  if (wrapped && /[<>]/.test(wrapped[1])) return false;
  return EMAIL.test(address);
}

export function validEmail(email) {
  return email.length <= 254 && EMAIL.test(email);
}

function formatUtcDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function letterLinks(entry) {
  return {
    play: `${SITE}/?word=${encodeURIComponent(entry.word)}`,
    puzzle: `${SITE}/?daily=1`,
    daily: `${SITE}/daily`
  };
}

export function buildLetter(entry, date, { unsubscribeUrl = UNSUBSCRIBE_PLACEHOLDER } = {}) {
  const links = letterLinks(entry);
  const when = formatUtcDate(date);
  const word = escapeHtml(entry.word);
  const pos = escapeHtml(entry.pos);
  const definition = escapeHtml(entry.en);
  const play = escapeHtml(links.play);
  const puzzle = escapeHtml(links.puzzle);
  const daily = escapeHtml(links.daily);
  const unsubscribe = escapeHtml(unsubscribeUrl);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(SUBJECT)}</title>
</head>
<body style="margin:0;padding:0;background:#17120e;color:#f6efe4;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(PREVIEW)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#17120e;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#f3ead7;color:#24180f;">
          <tr>
            <td style="padding:28px 28px 8px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0;letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:#7a3b32;">The Devil’s Dictionary</p>
              <h1 style="margin:12px 0 0;font-size:28px;font-weight:normal;line-height:1.2;">${escapeHtml(SUBJECT)}</h1>
              <p style="margin:12px 0 0;font-size:16px;line-height:1.5;">A morning letter for ${escapeHtml(when)} UTC. The subject refused to spoil it. The definition will not.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 0;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0;font-size:13px;letter-spacing:.12em;text-transform:uppercase;">${word}</p>
              <p style="margin:4px 0 0;font-style:italic;">${pos}</p>
              <blockquote style="margin:16px 0;padding:0 0 0 14px;border-left:3px solid #7a3b32;font-size:18px;line-height:1.45;">${definition}</blockquote>
              <p style="margin:0;font-size:16px;">${escapeHtml(SLOGAN)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.5;">
              <p style="margin:0 0 12px;"><a href="${play}" style="color:#7a3b32;">Play this word</a></p>
              <p style="margin:0 0 12px;"><a href="${puzzle}" style="color:#7a3b32;">Play today’s puzzle</a></p>
              <p style="margin:0 0 12px;"><a href="${daily}" style="color:#7a3b32;">Today’s page</a></p>
              <p style="margin:0;font-size:14px;color:#5c4a3a;">The letter names the word. The puzzle in the game is that same UTC entry, and it hides the word until you solve it.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.5;color:#5c4a3a;">
              <p style="margin:0;"><a href="${unsubscribe}" style="color:#7a3b32;">Unsubscribe</a> if the truth has overstayed.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  const text = `The Devil’s Dictionary
${SLOGAN}

${SUBJECT}
A morning letter for ${when} UTC.

${entry.word}
${entry.pos}

${entry.en}

Play this word: ${links.play}
Play today’s puzzle: ${links.puzzle}
Today’s page: ${links.daily}

Unsubscribe: ${unsubscribeUrl}
`;
  return {
    subject: SUBJECT,
    preview: PREVIEW,
    html,
    text,
    name: broadcastName(date),
    date: utcDateKey(date),
    word: entry.word,
    links
  };
}
