/* Halloween homepage intro.
 *
 * Covers the game homepage for one short beat, then reveals the normal
 * play UI. It does not touch the letter grid, subscribe form, or /api.
 *
 * Season, in the visitor's local calendar: 24 October through 2 November
 * (the week of Halloween through All Souls' Day). Outside that window
 * nothing is shown. index.html uses this same window and skips the
 * request entirely; the check below still applies when the file is
 * inlined (the offline edition) or forced with ?halloween=1.
 *
 *   ?halloween=1  play on this load, including outside the season
 *   ?halloween=0  never play, and hide the replay control
 *
 * Every full page load during the season plays the intro. Skip, Escape,
 * or letting the scene finish only closes this visit. Nothing is stored,
 * so a return to the homepage plays it again until the season ends.
 * The colophon control "Replay the Halloween intro" plays it again
 * without reloading.
 *
 * prefers-reduced-motion skips the grid, fire, and bats and holds the
 * definition card briefly. The card quotes only the real DESTINY entry
 * from app.js: “A tyrant’s authority for crime and fool’s excuse for failure.”
 *
 * Audio (original Web Audio synthesis — no samples, recordings, or
 * third-party files) plays only while this overlay is up: a short looping
 * drone, a card chime, and a bat flutter. It stops on skip, finish, stop(),
 * or leaving the page. Mute is remembered at localStorage
 * dd-halloween-audio-muted ("1" muted, "0" or absent unmuted). Reduced
 * motion keeps the drone and one soft chime, quieter, and skips the bats.
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

  const MUTE_KEY = "dd-halloween-audio-muted";

  const root = document.getElementById("halloweenIntro");
  const grid = document.getElementById("halloweenGrid");
  const skipBtn = document.getElementById("halloweenSkip");
  const soundBtn = document.getElementById("halloweenSound");
  const replayBtn = document.getElementById("halloweenReplay");
  const defEl = document.getElementById("halloweenDef");
  if (!root) return;

  let mode = "idle";
  let timers = [];
  let audioCtx = null;
  let masterGain = null;
  let bedSource = null;
  let bedGain = null;
  let bedBuffer = null;
  let audioGeneration = 0;
  let autoplayBlocked = false;
  let gestureArmed = false;
  let suppressSoundClick = false;
  const audioCues = [];

  function inSeason(now = new Date()) {
    const month = now.getMonth();
    const day = now.getDate();
    return (month === 9 && day >= 24) || (month === 10 && day <= 2);
  }

  function flag() {
    try {
      return new URLSearchParams(location.search).get("halloween");
    } catch {
      return null;
    }
  }

  function openingChoice(now = new Date()) {
    const forced = flag();
    if (forced === "0") return "off";
    if (forced !== "1" && !inSeason(now)) return "off";
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

  function readMuted() {
    try {
      return localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function writeMuted(muted) {
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {
      /* Private mode still toggles for this visit. */
    }
  }

  function reducedAudio() {
    return root.classList.contains("hw-reduce");
  }

  function showsMuted() {
    return readMuted() || autoplayBlocked;
  }

  function canHear() {
    return Boolean(
      audioCtx && masterGain && audioCtx.state === "running"
      && !readMuted() && mode === "playing"
    );
  }

  function syncSoundButton() {
    if (!soundBtn) return;
    const muted = showsMuted();
    soundBtn.classList.toggle("is-muted", muted);
    soundBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    soundBtn.setAttribute(
      "aria-label",
      muted ? "Unmute Halloween intro sound" : "Mute Halloween intro sound"
    );
    const label = soundBtn.querySelector(".hw-sound-label");
    if (label) label.textContent = muted ? "Muted" : "Sound";
  }

  function envelope(time, at, duration) {
    const unit = (time - at) / duration;
    if (unit <= 0 || unit >= 1) return 0;
    if (unit < 0.08) return unit / 0.08;
    return (1 - (unit - 0.08) / 0.92) ** 2;
  }

  // Four-second D-minor drone. Partials complete an integer number of
  // cycles so the loop does not click. Generated here; nothing is fetched.
  function makeBed(context) {
    const rate = context.sampleRate || 44100;
    const seconds = 4;
    const length = Math.max(1, Math.floor(rate * seconds));
    const buffer = context.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    const partials = [
      [73.5, 0.16],
      [87.5, 0.07],
      [110, 0.09],
      [146.75, 0.04]
    ];
    let wind = 0;
    for (let index = 0; index < length; index += 1) {
      const time = index / rate;
      let sample = 0;
      for (const [freq, amp] of partials) {
        sample += Math.sin(2 * Math.PI * freq * time) * amp;
      }
      const pulse = 0.86 + 0.14 * Math.sin((2 * Math.PI * time) / seconds);
      wind += ((Math.random() * 2 - 1) - wind) * 0.02;
      const motif = Math.sin(2 * Math.PI * 220 * time) * envelope(time, 0.4, 1.05) * 0.045
        + Math.sin(2 * Math.PI * 174.61 * time) * envelope(time, 2.3, 1.05) * 0.035;
      data[index] = sample * pulse + wind * 0.025 + motif;
    }
    return buffer;
  }

  function ensureAudio() {
    if (audioCtx && audioCtx.state !== "closed") return audioCtx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (typeof Ctor !== "function") return null;
    try {
      audioCtx = new Ctor();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(audioCtx.destination);
    } catch {
      audioCtx = null;
      masterGain = null;
      return null;
    }
    return audioCtx;
  }

  function startBed() {
    if (bedSource || !audioCtx || !masterGain || readMuted() || mode !== "playing") return;
    if (audioCtx.state === "closed") return;
    let source;
    try {
      if (!bedBuffer) bedBuffer = makeBed(audioCtx);
      source = audioCtx.createBufferSource();
      source.buffer = bedBuffer;
      source.loop = true;
      bedGain = audioCtx.createGain();
      bedGain.gain.value = reducedAudio() ? 0.34 : 0.46;
      let node = source;
      try {
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 720;
        source.connect(filter);
        node = filter;
      } catch {
        node = source;
      }
      node.connect(bedGain);
      bedGain.connect(masterGain);
      source.start();
    } catch {
      bedSource = null;
      bedGain = null;
      return;
    }
    bedSource = source;
  }

  function openMaster() {
    if (!audioCtx || !masterGain || audioCtx.state !== "running" || readMuted()) return;
    try {
      const now = audioCtx.currentTime || 0;
      const target = reducedAudio() ? 0.62 : 0.85;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value || 0, now);
      masterGain.gain.linearRampToValueAtTime(target, now + 0.08);
    } catch {
      /* The bed can still be heard if the gain was already open. */
    }
  }

  function silence() {
    if (bedSource) {
      try { bedSource.stop(); } catch { /* already stopped */ }
      try { bedSource.disconnect(); } catch { /* ignore */ }
    }
    bedSource = null;
    bedGain = null;
    if (audioCtx && masterGain && audioCtx.state !== "closed") {
      try {
        const now = audioCtx.currentTime || 0;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(0, now);
      } catch {
        /* ignore */
      }
    }
  }

  function stopAudio() {
    audioGeneration += 1;
    autoplayBlocked = false;
    disarmGesture();
    silence();
    bedBuffer = null;
    const closing = audioCtx;
    audioCtx = null;
    masterGain = null;
    if (closing && closing.state !== "closed" && typeof closing.close === "function") {
      closing.close().catch(() => {});
    }
  }

  function tone(frequency, duration, options = {}) {
    const start = audioCtx.currentTime + (options.delay || 0);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = options.type || "sine";
    osc.frequency.setValueAtTime(frequency, start);
    if (options.slide && options.slide !== frequency) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, options.slide), start + duration);
    }
    const level = Math.max(0.0001, options.gain || 0.05);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + Math.min(0.03, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function rustle(duration, frequency, level, delay = 0) {
    const start = audioCtx.currentTime + delay;
    const length = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) {
      const env = Math.sin((Math.PI * index) / length);
      data[index] = (Math.random() * 2 - 1) * env;
    }
    const source = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.setValueAtTime(0.8, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, level), start + Math.min(0.02, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(start);
    source.stop(start + duration + 0.02);
  }

  function duckBed(duration) {
    if (!bedGain || !audioCtx) return;
    const now = audioCtx.currentTime || 0;
    const base = reducedAudio() ? 0.34 : 0.46;
    try {
      bedGain.gain.cancelScheduledValues(now);
      bedGain.gain.setValueAtTime(Math.max(0.0001, bedGain.gain.value || base), now);
      bedGain.gain.linearRampToValueAtTime(base * 0.55, now + 0.04);
      bedGain.gain.linearRampToValueAtTime(base, now + duration);
    } catch {
      /* ignore */
    }
  }

  function cardReveal() {
    const soft = reducedAudio();
    rustle(soft ? 0.12 : 0.18, 1500, soft ? 0.035 : 0.06);
    tone(440, soft ? 0.26 : 0.34, { type: "sine", gain: soft ? 0.04 : 0.08, slide: 523.25 });
    if (!soft) tone(659.25, 0.28, { type: "triangle", gain: 0.04, delay: 0.05 });
  }

  function batFlutter() {
    rustle(0.055, 2100, 0.055, 0);
    rustle(0.05, 2700, 0.045, 0.09);
    rustle(0.045, 1800, 0.04, 0.17);
    tone(784, 0.2, { type: "sine", gain: 0.028, slide: 392, delay: 0.02 });
  }

  function fireSfx(kind) {
    if (!canHear() || audioCues.includes(kind)) return;
    if (kind === "bats" && reducedAudio()) return;
    audioCues.push(kind);
    try {
      if (kind === "card") {
        duckBed(0.45);
        cardReveal();
      } else if (kind === "bats") {
        duckBed(0.4);
        batFlutter();
      }
    } catch {
      /* A failed cue should not take the overlay down with it. */
    }
  }

  function flushSfx() {
    if (root.classList.contains("scene-bats")) fireSfx("bats");
    else if (root.classList.contains("scene-scroll") || reducedAudio()) fireSfx("card");
  }

  function markBlocked() {
    if (mode !== "playing" || readMuted()) return;
    autoplayBlocked = true;
    armGesture();
    syncSoundButton();
  }

  function applyPlayback(generation) {
    if (generation !== audioGeneration || mode !== "playing" || readMuted()) return;
    if (!audioCtx || audioCtx.state !== "running") {
      markBlocked();
      return;
    }
    autoplayBlocked = false;
    disarmGesture();
    try {
      startBed();
      openMaster();
      flushSfx();
    } catch {
      /* ignore */
    }
    syncSoundButton();
  }

  function beginPlayback() {
    const generation = audioGeneration;
    if (readMuted()) {
      syncSoundButton();
      return;
    }
    let context = null;
    try { context = ensureAudio(); } catch { context = null; }
    if (!context) {
      if (generation === audioGeneration && mode === "playing") {
        autoplayBlocked = true;
        syncSoundButton();
      }
      return;
    }
    armGesture();
    try { startBed(); } catch { /* resume may still unlock a later attempt */ }
    let pending = null;
    try { pending = context.resume(); } catch { pending = null; }
    applyPlayback(generation);
    if (pending && typeof pending.then === "function") {
      pending.then(() => applyPlayback(generation)).catch(() => {
        if (generation !== audioGeneration || mode !== "playing") return;
        markBlocked();
      });
    }
  }

  function disarmGesture() {
    if (!gestureArmed) return;
    gestureArmed = false;
    document.removeEventListener("pointerdown", onUnlockGesture, true);
    document.removeEventListener("keydown", onUnlockGesture, true);
  }

  function armGesture() {
    if (gestureArmed) return;
    gestureArmed = true;
    document.addEventListener("pointerdown", onUnlockGesture, true);
    document.addEventListener("keydown", onUnlockGesture, true);
  }

  function onUnlockGesture(event) {
    if (mode !== "playing") return;
    const target = event.target;
    if (soundBtn && target && soundBtn.contains(target)) return;
    if (skipBtn && target && skipBtn.contains(target)) return;
    if (readMuted()) {
      try { ensureAudio()?.resume()?.catch(() => {}); } catch { /* ignore */ }
      return;
    }
    const generation = audioGeneration;
    let pending = null;
    try { pending = ensureAudio()?.resume(); } catch { pending = null; }
    applyPlayback(generation);
    if (pending && typeof pending.then === "function") {
      pending.then(() => applyPlayback(generation)).catch(() => {});
    }
  }

  function toggleSound() {
    if (mode !== "playing") return;
    if (showsMuted()) {
      writeMuted(false);
      autoplayBlocked = false;
      beginPlayback();
    } else {
      writeMuted(true);
      autoplayBlocked = false;
      silence();
      disarmGesture();
      syncSoundButton();
    }
  }

  function onSoundPointer(event) {
    if (mode !== "playing") return;
    suppressSoundClick = true;
    toggleSound();
    if (event.type === "pointerdown") event.preventDefault();
  }

  function onSoundKey(event) {
    if (mode !== "playing") return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    suppressSoundClick = true;
    toggleSound();
  }

  function onSoundClick(event) {
    if (suppressSoundClick) {
      suppressSoundClick = false;
      event.preventDefault();
      return;
    }
    toggleSound();
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
    if (name === "scroll") fireSfx("card");
    if (name === "bats") fireSfx("bats");
  }

  function focusControl(el) {
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
    } catch {
      try { el.focus(); } catch { /* ignore */ }
    }
  }

  function finish() {
    if (mode !== "playing" || !root.isConnected) return;
    mode = "closing";
    clearTimers();
    stopAudio();
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
    stopAudio();
    mode = "playing";
    audioCues.length = 0;
    const reduce = prefersReduced();
    buildGrid();
    if (defEl) delete defEl.dataset.announced;
    root.className = reduce ? "hw hw-reduce scene-scroll" : "hw scene-night";
    syncSoundButton();
    root.hidden = false;
    document.body.classList.add("hw-lock");
    lockShell();
    if (reduce) announceDef();
    if (!reduce) {
      for (const [name, at] of FULL) later(() => setScene(name), at);
    }
    later(() => finish(), reduce ? REDUCED_END : FULL_END);
    beginPlayback();
    focusControl(skipBtn);
  }

  function replay() {
    if (mode === "playing") return;
    play();
  }

  function stop() {
    clearTimers();
    stopAudio();
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
      const controls = [soundBtn, skipBtn].filter(Boolean);
      if (!controls.length) return;
      event.preventDefault();
      event.stopPropagation();
      const current = controls.indexOf(document.activeElement);
      const delta = event.shiftKey ? -1 : 1;
      const next = controls[(current + delta + controls.length) % controls.length];
      focusControl(next);
    }
  }

  skipBtn?.addEventListener("click", () => finish());
  soundBtn?.addEventListener("pointerdown", onSoundPointer);
  soundBtn?.addEventListener("keydown", onSoundKey);
  soundBtn?.addEventListener("click", onSoundClick);
  replayBtn?.addEventListener("click", () => replay());
  document.addEventListener("keydown", onKey, true);
  window.addEventListener("pagehide", () => {
    const during = mode === "playing";
    stopAudio();
    if (!during) return;
    autoplayBlocked = true;
    syncSoundButton();
    armGesture();
  });

  window.__HALLOWEEN_INTRO__ = {
    inSeason,
    openingChoice,
    replay,
    play,
    stop,
    audioCues,
    audioMuted: readMuted
  };

  syncReplay();
  // The homepage adds the stylesheet from script so it stays off the
  // critical path. Wait for it before uncovering the overlay, or the
  // scene would flash in normal flow. No link (tests, offline file)
  // means the rules are already here.
  const cssLink = document.querySelector("link[data-halloween-css]");
  let sheetReady = false;
  if (cssLink) {
    try { sheetReady = Boolean(cssLink.sheet); }
    catch { sheetReady = false; }
  }
  const cssPending = cssLink
    && cssLink.getAttribute("data-halloween-css") !== "ready"
    && !sheetReady;
  const begin = () => {
    if (openingChoice() === "play") play();
  };
  if (cssPending) {
    cssLink.addEventListener("load", begin, { once: true });
    cssLink.addEventListener("error", begin, { once: true });
  } else {
    begin();
  }
})();
