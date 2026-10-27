/**
 * Daily puzzle calendar, streak, and spoiler-free share.
 *
 * The site already publishes one word per UTC date: /daily, the morning
 * letter, and dailyEntry() in lib/landing.mjs all use midnight UTC and the
 * epoch 2026-01-01. This module uses that same clock and the same index into
 * the 100 entries, so the playable puzzle and the public page cannot disagree.
 *
 * America/Los_Angeles is not the day boundary. A Pacific date would name a
 * different word than /daily for part of each evening. A new puzzle starts
 * at midnight UTC.
 *
 * The share text is a score: date, emoji rows, streak, and a link. It must
 * not contain the answer. Callers pass the length, never the word.
 */
(function (global) {
  "use strict";

  const EPOCH_UTC = Date.UTC(2026, 0, 1);
  const STORAGE_KEY = "devils-dictionary-daily-v1";
  const SHARE_URL = "https://devildictionary.com/?daily=1";
  const TIMEZONE = "UTC";
  const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

  function utcDateKey(date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function daysSinceEpoch(date) {
    const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return Math.floor((utc - EPOCH_UTC) / 86400000);
  }

  function dailyWordIndex(date, length) {
    const count = Number(length) || 1;
    const days = daysSinceEpoch(date);
    return ((days % count) + count) % count;
  }

  function puzzleNumber(date) {
    return daysSinceEpoch(date) + 1;
  }

  function previousDateKey(dateKey) {
    const match = DATE_KEY.exec(String(dateKey || ""));
    if (!match) return "";
    const utc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) - 1);
    return utcDateKey(new Date(utc));
  }

  function emptyDailyState() {
    return { streak: 0, best: 0, lastSolved: "", solved: {} };
  }

  function normalizeDailyState(raw) {
    const empty = emptyDailyState();
    if (!raw || typeof raw !== "object") return empty;
    const streak = Number.isFinite(raw.streak) && raw.streak > 0 ? Math.floor(raw.streak) : 0;
    const best = Number.isFinite(raw.best) && raw.best > 0 ? Math.floor(raw.best) : 0;
    const lastSolved = typeof raw.lastSolved === "string" && DATE_KEY.test(raw.lastSolved) ? raw.lastSolved : "";
    const solved = {};
    if (raw.solved && typeof raw.solved === "object") {
      for (const [key, value] of Object.entries(raw.solved)) {
        if (!DATE_KEY.test(key) || !value || typeof value !== "object") continue;
        solved[key] = {
          misses: Number.isFinite(value.misses) && value.misses > 0 ? Math.min(99, Math.floor(value.misses)) : 0,
          hinted: Boolean(value.hinted),
          length: Number.isFinite(value.length) && value.length > 0 ? Math.min(24, Math.floor(value.length)) : 1
        };
      }
    }
    return { streak, best: Math.max(best, streak), lastSolved, solved };
  }

  function visibleStreak(state, todayKey) {
    const current = normalizeDailyState(state);
    if (!current.lastSolved) return 0;
    if (current.lastSolved === todayKey) return current.streak;
    if (current.lastSolved === previousDateKey(todayKey)) return current.streak;
    return 0;
  }

  function pruneSolved(solved, todayKey) {
    const todayUtc = Date.parse(`${todayKey}T00:00:00Z`);
    const next = {};
    for (const [key, value] of Object.entries(solved)) {
      const when = Date.parse(`${key}T00:00:00Z`);
      if (Number.isNaN(when)) continue;
      if (todayUtc - when <= 400 * 86400000 && todayUtc - when >= -86400000) next[key] = value;
    }
    if (solved[todayKey]) next[todayKey] = solved[todayKey];
    return next;
  }

  function recordSolve(state, todayKey, result) {
    const current = normalizeDailyState(state);
    if (!DATE_KEY.test(String(todayKey || ""))) return { state: current, changed: false };
    if (current.solved[todayKey] || current.lastSolved === todayKey) {
      return { state: current, changed: false };
    }
    const alive = current.lastSolved === previousDateKey(todayKey);
    const streak = alive ? current.streak + 1 : 1;
    const best = Math.max(current.best || 0, streak);
    const solved = {
      ...current.solved,
      [todayKey]: {
        misses: Number.isFinite(result?.misses) && result.misses > 0 ? Math.min(99, Math.floor(result.misses)) : 0,
        hinted: Boolean(result?.hinted),
        length: Number.isFinite(result?.length) && result.length > 0 ? Math.min(24, Math.floor(result.length)) : 1
      }
    };
    return {
      state: { streak, best, lastSolved: todayKey, solved: pruneSolved(solved, todayKey) },
      changed: true
    };
  }

  function shareResult({ puzzle, dateKey, length, misses, streak, hinted }) {
    const width = Math.max(1, Math.min(24, Math.floor(Number(length) || 1)));
    const wrongCount = Math.max(0, Math.floor(Number(misses) || 0));
    const solvedRow = "🟩".repeat(width);
    const missRow = "⬛".repeat(width);
    const rows = [];
    const shown = Math.min(wrongCount, 6);
    for (let i = 0; i < shown; i += 1) rows.push(missRow);
    if (wrongCount > shown) rows.push(`+${wrongCount - shown} more`);
    rows.push(solvedRow);
    const lines = [
      `The Devil’s Dictionary #${Math.max(0, Math.floor(Number(puzzle) || 0))}`,
      `${dateKey} UTC`,
      ...rows,
      `Streak ${Math.max(0, Math.floor(Number(streak) || 0))}`
    ];
    if (hinted) lines.push("Hint used");
    lines.push(SHARE_URL);
    return lines.join("\n");
  }

  const api = {
    EPOCH_UTC,
    STORAGE_KEY,
    SHARE_URL,
    TIMEZONE,
    utcDateKey,
    daysSinceEpoch,
    dailyWordIndex,
    puzzleNumber,
    previousDateKey,
    emptyDailyState,
    normalizeDailyState,
    visibleStreak,
    recordSolve,
    shareResult
  };

  global.DDDaily = api;
  if (typeof module === "object" && module && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
