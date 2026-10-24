/* Halloween homepage intro.
 *
 * Covers the game homepage for one short beat, then reveals the normal
 * play UI. It does not touch the letter grid, subscribe form, or /api.
 *
 * Season, in the visitor's local calendar: 24 October through 2 November
 * (the week of Halloween through All Souls' Day). Outside that window
 * nothing is shown.
 *
 *   ?halloween=1  play even after it has been seen, including outside the season
 *   ?halloween=0  never play, and hide the replay control
 *
 * Skip, Escape, or letting the scene finish stores
 * dd-halloween-intro-YYYY=seen for that calendar year. The colophon
 * control "Replay the Halloween intro" clears the flag and plays it again.
 *
 * prefers-reduced-motion skips the grid, fire, and bats and holds the
 * definition card briefly. The card quotes only the real DESTINY entry
 * from app.js: “A tyrant’s authority for crime and fool’s excuse for failure.”
 */
(() => {
  "use strict";

  if (window.__HALLOWEEN_INTRO__) return;

  const ROWS = ["WITCHES", "FORESTS", "DESTINY", "PUMPKIN", "SPIRITS"];
  const FULL = [
    ["grid", 800],
    ["fire", 1600],
    ["scroll", 3200],
    ["bats", 6300]
  ];
  const FULL_END = 7100;
  const REDUCED_END = 1800;

  const root = document.getElementById("halloweenIntro");
  const grid = document.getElementById("halloweenGrid");
  const skipBtn = document.getElementById("halloweenSkip");
  const replayBtn = document.getElementById("halloweenReplay");
  const defEl = document.getElementById("halloweenDef");
  if (!root) return;

  let mode = "idle";
  let timers = [];

  function inSeason(now = new Date()) {
    const month = now.getMonth();
    const day = now.getDate();
    return (month === 9 && day >= 24) || (month === 10 && day <= 2);
  }

  function storageKey(now = new Date()) {
    return `dd-halloween-intro-${now.getFullYear()}`;
  }

  function flag() {
    try {
      return new URLSearchParams(location.search).get("halloween");
    } catch {
      return null;
    }
  }

  function readSeen(now) {
    try {
      return localStorage.getItem(storageKey(now));
    } catch {
      return null;
    }
  }

  function markSeen(now = new Date()) {
    try {
      localStorage.setItem(storageKey(now), "seen");
    } catch {
      /* Private mode and blocked storage still get the intro; it just won't be remembered. */
    }
  }

  function openingChoice(now = new Date()) {
    const forced = flag();
    if (forced === "0") return "off";
    if (forced !== "1" && !inSeason(now)) return "off";
    if (forced !== "1" && readSeen(now) === "seen") return "seen";
    return "play";
  }

  function replayVisible(now = new Date()) {
    const forced = flag();
    if (forced === "0") return false;
    if (forced === "1") return true;
    return inSeason(now);
  }

  function prefersReduced() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches === true;
    } catch {
      return false;
    }
  }

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function clearTimers() {
    for (const id of timers) clearTimeout(id);
    timers = [];
  }

  function syncReplay() {
    if (!replayBtn) return;
    replayBtn.hidden = !replayVisible();
  }

  function lockShell() {
    const shell = document.querySelector(".shell");
    if (!shell) return;
    shell.setAttribute("aria-hidden", "true");
    try { shell.inert = true; } catch { /* ignore */ }
  }

  function releaseShell() {
    const shell = document.querySelector(".shell");
    if (!shell) return;
    shell.removeAttribute("aria-hidden");
    try { shell.inert = false; } catch { /* ignore */ }
  }

  function buildGrid() {
    if (!grid) return;
    grid.replaceChildren();
    ROWS.forEach((row, rowIndex) => {
      for (const letter of row) {
        const cell = document.createElement("span");
        cell.className = "hw-cell";
        cell.textContent = letter;
        if (rowIndex === 2) cell.dataset.destiny = "1";
        grid.appendChild(cell);
      }
    });
  }

  function announceDef() {
    if (!defEl || defEl.dataset.announced === "1") return;
    defEl.dataset.announced = "1";
    const text = defEl.textContent;
    defEl.textContent = "";
    defEl.textContent = text;
  }

  function setScene(name) {
    if (mode !== "playing" || !root.isConnected) return;
    root.classList.remove("scene-night", "scene-grid", "scene-fire", "scene-scroll", "scene-bats");
    root.classList.add(`scene-${name}`);
    if (name === "fire" && grid) {
      grid.querySelectorAll("[data-destiny]").forEach((cell, index) => {
        later(() => cell.classList.add("lit"), index * 140);
      });
    }
    if (name === "scroll") announceDef();
  }

  function focusSkip() {
    if (!skipBtn) return;
    try {
      skipBtn.focus({ preventScroll: true });
    } catch {
      try { skipBtn.focus(); } catch { /* ignore */ }
    }
  }

  function finish() {
    if (mode !== "playing" || !root.isConnected) return;
    mode = "closing";
    clearTimers();
    markSeen();
    root.classList.add("scene-out");
    const delay = root.classList.contains("hw-reduce") ? 40 : 640;
    later(() => {
      if (mode !== "closing" || !root.isConnected) return;
      root.hidden = true;
      root.className = "hw";
      document.body.classList.remove("hw-lock");
      releaseShell();
      mode = "idle";
      syncReplay();
    }, delay);
  }

  function play() {
    if (!root.isConnected || mode === "playing") return;
    clearTimers();
    mode = "playing";
    const reduce = prefersReduced();
    buildGrid();
    if (defEl) delete defEl.dataset.announced;
    root.className = reduce ? "hw hw-reduce scene-scroll" : "hw scene-night";
    root.hidden = false;
    document.body.classList.add("hw-lock");
    lockShell();
    if (reduce) announceDef();
    if (!reduce) {
      for (const [name, at] of FULL) later(() => setScene(name), at);
    }
    later(() => finish(), reduce ? REDUCED_END : FULL_END);
    focusSkip();
  }

  function replay() {
    if (mode === "playing") return;
    try { localStorage.removeItem(storageKey()); } catch { /* ignore */ }
    play();
  }

  function stop() {
    clearTimers();
    mode = "idle";
    if (root.isConnected) {
      root.hidden = true;
      root.className = "hw";
    }
    document.body.classList.remove("hw-lock");
    releaseShell();
  }

  function onKey(event) {
    if (mode !== "playing") return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      finish();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      focusSkip();
    }
  }

  skipBtn?.addEventListener("click", () => finish());
  replayBtn?.addEventListener("click", () => replay());
  document.addEventListener("keydown", onKey, true);

  window.__HALLOWEEN_INTRO__ = {
    inSeason,
    openingChoice,
    storageKey,
    replay,
    play,
    stop
  };

  syncReplay();
  if (openingChoice() === "play") play();
})();
