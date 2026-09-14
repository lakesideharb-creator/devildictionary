(() => {
  "use strict";

  const ENTRIES = [
    { word: "EGO", pos: "noun", en: "The pocket mirror in which the universe is expected to admire itself.", tier: 1 },
    { word: "HOPE", pos: "noun", en: "A loan taken from tomorrow, with no intention of reading the interest rate.", tier: 1 },
    { word: "LUCK", pos: "noun", en: "Skill, as described by its beneficiary; injustice, as described by everyone else.", tier: 1 },
    { word: "BOSS", pos: "noun", en: "One who arrives late because time reports to them.", tier: 1 },
    { word: "RULE", pos: "noun", en: "A fence built by those already standing on the pleasant side.", tier: 1 },
    { word: "FAME", pos: "noun", en: "The punishment of being recognized by people you would never recognize.", tier: 1 },
    { word: "DUTY", pos: "noun", en: "A desire that has learned to wear someone else’s uniform.", tier: 1 },
    { word: "TASTE", pos: "noun", en: "An opinion wealthy enough to hire confidence.", tier: 1 },
    { word: "TRUTH", pos: "noun", en: "A fact that survived the meeting where the story was approved.", tier: 1 },
    { word: "SMILE", pos: "noun", en: "A curve that conceals the shortest distance between two suspicions.", tier: 1 },
    { word: "SLEEP", pos: "noun", en: "A rehearsal for death, interrupted daily by invoices.", tier: 1 },
    { word: "MONEY", pos: "noun", en: "A universal language in which everyone develops an accent near the bill.", tier: 1 },
    { word: "ADVICE", pos: "noun", en: "A gift whose receipt is kept longer than its contents.", tier: 1 },
    { word: "FRIEND", pos: "noun", en: "A witness for the defense who has read the prosecution’s notes.", tier: 1 },
    { word: "HONEST", pos: "adj.", en: "Temporarily unable to calculate the profitable answer.", tier: 1 },

    { word: "CAREER", pos: "noun", en: "A ladder that becomes a treadmill one promotion at a time.", tier: 2 },
    { word: "EXPERT", pos: "noun", en: "A person who knows exactly why yesterday’s certainty failed.", tier: 2 },
    { word: "STATUS", pos: "noun", en: "The altitude at which one begins mistaking thin air for applause.", tier: 2 },
    { word: "POLITE", pos: "adj.", en: "Skilled at wrapping contempt so the recipient thanks you for the parcel.", tier: 2 },
    { word: "REGRET", pos: "noun", en: "Wisdom that arrives after the witnesses have gone home.", tier: 2 },
    { word: "SECRET", pos: "noun", en: "Information told to one person at a time until everyone is trustworthy.", tier: 2 },
    { word: "MEETING", pos: "noun", en: "A ceremony in which minutes are kept and hours are lost.", tier: 2 },
    { word: "SUCCESS", pos: "noun", en: "The moment your old mistakes acquire biographers.", tier: 2 },
    { word: "NORMAL", pos: "adj.", en: "Common enough to escape examination.", tier: 2 },
    { word: "PROMISE", pos: "noun", en: "A future fact still protected from evidence.", tier: 2 },
    { word: "LOYALTY", pos: "noun", en: "The virtue of remembering which side currently signs the checks.", tier: 2 },
    { word: "REPUTE", pos: "noun", en: "A shadow that complains whenever its owner changes direction.", tier: 2 },
    { word: "CHOICE", pos: "noun", en: "The freedom to select which consequence will later feel imposed.", tier: 2 },
    { word: "MATURE", pos: "adj.", en: "Too experienced to be surprised, too tired to be impressed.", tier: 2 },
    { word: "JUSTICE", pos: "noun", en: "A balance admired most by those holding the weights.", tier: 2 },

    { word: "AMBITION", pos: "noun", en: "The art of climbing a ladder while explaining that height is vulgar.", tier: 3 },
    { word: "CONSENSUS", pos: "noun", en: "A conclusion everyone can defend because nobody remembers proposing it.", tier: 3 },
    { word: "PROGRESS", pos: "noun", en: "Replacing an old inconvenience with one that requires a password.", tier: 3 },
    { word: "INNOCENT", pos: "adj.", en: "Not yet supplied with a sufficiently detailed accusation.", tier: 3 },
    { word: "EDUCATION", pos: "noun", en: "The discovery that ignorance can be itemized and financed.", tier: 3 },
    { word: "TRADITION", pos: "noun", en: "A dead person’s vote in a living person’s decision.", tier: 3 },
    { word: "AUTHORITY", pos: "noun", en: "Confidence backed by furniture, a title, and a locked door.", tier: 3 },
    { word: "ORIGINAL", pos: "adj.", en: "Copied from a source the audience has not yet discovered.", tier: 3 },
    { word: "STRATEGY", pos: "noun", en: "A story explaining why the accident was always the destination.", tier: 3 },
    { word: "CERTAINTY", pos: "noun", en: "Doubt promoted beyond its competence.", tier: 3 },
    { word: "PATIENCE", pos: "noun", en: "The noble name we give to waiting when leaving is expensive.", tier: 3 },
    { word: "PRINCIPLE", pos: "noun", en: "A rule kept most firmly when it costs someone else.", tier: 3 },
    { word: "CULTURE", pos: "noun", en: "What remains after a group forgets why it began behaving that way.", tier: 3 },
    { word: "NETWORK", pos: "noun", en: "Friendship measured in future usefulness.", tier: 3 },
    { word: "LEGACY", pos: "noun", en: "An argument with the future conducted by someone unable to hear the reply.", tier: 3 }
  ];

  const JUDGMENT_DECOYS = {
    CAREER: [
      { bias: "COMFORT", en: "A professional path through which effort becomes expertise and leadership." },
      { bias: "ORDER", en: "A sequence of roles shaped by skill, opportunity, and persistence." }
    ],
    EXPERT: [
      { bias: "COMFORT", en: "Someone whose specialized knowledge makes uncertain decisions more reliable." },
      { bias: "ORDER", en: "A professional recognized by peers for mastering a narrow field." }
    ],
    STATUS: [
      { bias: "COMFORT", en: "A position earned when achievement becomes visible to others." },
      { bias: "ORDER", en: "A social rank that organizes responsibility, influence, and respect." }
    ],
    POLITE: [
      { bias: "COMFORT", en: "Showing consideration for others through tact and restraint." },
      { bias: "ORDER", en: "Following the social rules that allow strangers to coexist smoothly." }
    ],
    REGRET: [
      { bias: "COMFORT", en: "Pain caused by wishing a past decision had been different." },
      { bias: "ORDER", en: "Evidence that conscience has examined experience and learned from it." }
    ],
    SECRET: [
      { bias: "COMFORT", en: "Information protected because disclosure would cause unnecessary harm." },
      { bias: "ORDER", en: "A confidence shared only with those entitled to know it." }
    ],
    MEETING: [
      { bias: "COMFORT", en: "A scheduled discussion where a group turns many views into one decision." },
      { bias: "ORDER", en: "A formal gathering for exchanging information and assigning action." }
    ],
    SUCCESS: [
      { bias: "COMFORT", en: "The achievement of a meaningful goal through sustained effort." },
      { bias: "ORDER", en: "A favorable outcome recognized by oneself, one’s peers, or society." }
    ],
    NORMAL: [
      { bias: "COMFORT", en: "Belonging comfortably within the healthy range of human difference." },
      { bias: "ORDER", en: "Conforming to the pattern most commonly observed in a population." }
    ],
    PROMISE: [
      { bias: "COMFORT", en: "An assurance given so another person may safely rely on you." },
      { bias: "ORDER", en: "A commitment that binds future conduct to words spoken in the present." }
    ],
    LOYALTY: [
      { bias: "COMFORT", en: "Steadfast support maintained through difficulty and change." },
      { bias: "ORDER", en: "A durable allegiance created by trust, duty, or shared identity." }
    ],
    REPUTE: [
      { bias: "COMFORT", en: "The respect accumulated when character remains consistent over time." },
      { bias: "ORDER", en: "The public estimate of a person formed from past conduct." }
    ],
    CHOICE: [
      { bias: "COMFORT", en: "The power to select the path that best reflects one’s values." },
      { bias: "ORDER", en: "A decision made after comparing the available alternatives." }
    ],
    MATURE: [
      { bias: "COMFORT", en: "Able to meet complexity with perspective, patience, and self-command." },
      { bias: "ORDER", en: "Having reached the expected level of emotional and intellectual development." }
    ],
    JUSTICE: [
      { bias: "COMFORT", en: "The fair protection of each person’s dignity, rights, and due reward." },
      { bias: "ORDER", en: "The impartial application of rules to comparable acts and disputes." }
    ]
  };

  const STORAGE_KEY = "devils-dictionary-save-v3";
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const els = Object.fromEntries([
    "board", "pathLayer", "selectionText", "targetWord", "folio", "hintButton", "shuffleButton",
    "coinCount", "completedCount", "totalCount", "progressFill", "coinPips", "coinRuleText",
    "stageName", "definitionModal", "definitionWord", "definitionPos", "definitionText",
    "definitionReveal", "judgmentPrompt", "definitionChoices", "judgmentFeedback", "readerNote",
    "newEntryBadge", "modalProgress", "nextButton", "coinCelebration", "coinMilestone", "stageCurtain",
    "toast", "coinVault", "soundToggle", "resetButton", "gestureNote"
  ].map(id => [id, document.getElementById(id)]));

  let save = loadSave();
  let round = null;
  let selection = [];
  let dragging = false;
  let hintTimer = null;
  let toastTimer = null;
  let solvedLock = false;
  const sound = createSoundEngine();

  function loadSave() {
    const blank = {
      completed: [], order: [], current: null, hints: 0, rounds: 0,
      judgment: { comfort: 0, order: 0, correct: 0, firstTry: 0 }, sound: true
    };
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return blank;
      const valid = new Set(ENTRIES.map(entry => entry.word));
      parsed.completed = [...new Set(Array.isArray(parsed.completed) ? parsed.completed : [])].filter(word => valid.has(word));
      parsed.order = Array.isArray(parsed.order) ? parsed.order.filter(word => valid.has(word)) : [];
      parsed.hints = Number.isFinite(parsed.hints) ? parsed.hints : 0;
      parsed.rounds = Number.isFinite(parsed.rounds) ? parsed.rounds : 0;
      parsed.sound = parsed.sound !== false;
      const judgment = parsed.judgment && typeof parsed.judgment === "object" ? parsed.judgment : {};
      parsed.judgment = Object.fromEntries(["comfort", "order", "correct", "firstTry"].map(key => [
        key, Number.isFinite(judgment[key]) ? Math.max(0, judgment[key]) : 0
      ]));
      return { ...blank, ...parsed };
    } catch {
      return blank;
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }

  function createSoundEngine() {
    let context = null;
    let master = null;
    let lastLetterAt = 0;

    function ready() {
      if (!save.sound) return null;
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      if (!context) {
        context = new AudioCtor();
        master = context.createGain();
        master.gain.value = .42;
        master.connect(context.destination);
      }
      if (context.state === "suspended") context.resume().catch(() => {});
      return context;
    }

    function tone(frequency, duration, options = {}) {
      const ctx = ready();
      if (!ctx) return;
      const start = ctx.currentTime + (options.delay || 0);
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = options.type || "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      if (options.slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.slide), start + duration);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(options.gain || .08, start + Math.min(.018, duration / 3));
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(start);
      oscillator.stop(start + duration + .03);
    }

    function noise(duration, options = {}) {
      const ctx = ready();
      if (!ctx) return;
      const start = ctx.currentTime + (options.delay || 0);
      const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1) {
        const fade = 1 - index / length;
        data[index] = (Math.random() * 2 - 1) * fade;
      }
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      filter.type = options.filterType || "bandpass";
      filter.frequency.value = options.frequency || 1100;
      filter.Q.value = options.q || .8;
      gain.gain.setValueAtTime(options.gain || .05, start);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(start);
    }

    return {
      letter(step) {
        const now = performance.now();
        if (now - lastLetterAt < 28) return;
        lastLetterAt = now;
        tone(175 + (step % 5) * 19, .045, { type: "square", gain: .035, slide: 135 });
        noise(.026, { gain: .028, frequency: 1850 + step * 45 });
      },
      hint() {
        noise(.42, { gain: .035, frequency: 2400, q: 2.8 });
        [740, 880, 1110].forEach((frequency, index) => tone(frequency, .18, { type: "triangle", gain: .025, delay: index * .09 }));
      },
      invalid() {
        tone(145, .24, { type: "sawtooth", gain: .08, slide: 72 });
        noise(.09, { gain: .05, frequency: 260 });
      },
      word() {
        noise(.13, { gain: .075, frequency: 520, filterType: "lowpass" });
        tone(110, .28, { type: "triangle", gain: .09, slide: 165 });
        tone(330, .18, { type: "square", gain: .026, delay: .07, slide: 220 });
      },
      judgment() {
        tone(146.8, .72, { type: "sine", gain: .06 });
        tone(220, .58, { type: "triangle", gain: .045, delay: .08 });
        noise(.22, { gain: .022, frequency: 1300, delay: .04 });
      },
      rejected() {
        noise(.075, { gain: .11, frequency: 180, filterType: "lowpass" });
        tone(82, .27, { type: "square", gain: .075, slide: 55 });
      },
      truth() {
        noise(.14, { gain: .055, frequency: 900 });
        [146.8, 220, 293.7, 440].forEach((frequency, index) => {
          tone(frequency, .65 - index * .06, { type: index % 2 ? "triangle" : "sine", gain: .055, delay: index * .075 });
        });
      },
      coin() {
        for (let index = 0; index < 10; index += 1) {
          tone(980 + index * 78, .07, { type: "triangle", gain: .032, delay: index * .052 });
        }
        tone(1760, .72, { type: "sine", gain: .09, delay: .54 });
        tone(880, .65, { type: "sine", gain: .055, delay: .56 });
      },
      coinTap() {
        tone(1320, .24, { type: "triangle", gain: .06 });
        tone(1760, .32, { type: "sine", gain: .045, delay: .06 });
      },
      page() {
        noise(.12, { gain: .045, frequency: 1500, q: 1.6 });
        tone(205, .09, { type: "square", gain: .025, delay: .05, slide: 150 });
      },
      stage() {
        noise(.8, { gain: .05, frequency: 210, filterType: "lowpass" });
        [55, 82.4, 110, 164.8].forEach((frequency, index) => {
          tone(frequency, 1.35 - index * .08, { type: "sine", gain: .08, delay: index * .13, slide: frequency * 1.5 });
        });
      },
      shuffle() {
        [330, 277, 220].forEach((frequency, index) => tone(frequency, .08, { type: "square", gain: .03, delay: index * .055, slide: frequency * .82 }));
        noise(.18, { gain: .035, frequency: 1250 });
      },
      enabled() {
        tone(660, .12, { type: "triangle", gain: .045 });
        tone(990, .28, { type: "sine", gain: .055, delay: .08 });
      },
      disabled() {
        tone(440, .11, { type: "triangle", gain: .04 });
        tone(220, .2, { type: "sine", gain: .045, delay: .07 });
      }
    };
  }

  function getStage(count = save.completed.length) {
    if (count < 15) return { tier: 1, name: "STAGE I · THE LITERATE", size: 5, title: "Find the word" };
    if (count < 30) return { tier: 2, name: "STAGE II · THE DOUBTER", size: 6, title: "Read between the letters" };
    return { tier: 3, name: "STAGE III · THE ACCOMPLICE", size: 7, title: "The definition is watching" };
  }

  function pickEntry() {
    const stage = getStage();
    const eligible = ENTRIES.filter(entry => entry.tier <= stage.tier);
    let unseen = eligible.filter(entry => !save.completed.includes(entry.word));
    if (!unseen.length) unseen = ENTRIES.filter(entry => !save.completed.includes(entry.word));
    const pool = unseen.length ? unseen : eligible;
    const recent = new Set(save.order.slice(-5));
    const fresh = pool.filter(entry => !recent.has(entry.word));
    return (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length ? fresh.length : pool.length))];
  }

  function makeBoard(entry, reshuffle = false) {
    const stage = getStage();
    const size = Math.max(stage.size, entry.word.length > 8 ? 7 : entry.word.length > 6 ? 6 : 5);
    const path = generatePath(size, entry.word.length);
    const letters = Array.from({ length: size * size }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
    path.forEach((cellIndex, i) => { letters[cellIndex] = entry.word[i]; });

    const decoys = stage.tier > 1 ? Math.min(5, entry.word.length) : 2;
    for (let i = 0; i < decoys; i += 1) {
      const emptyIndex = Math.floor(Math.random() * letters.length);
      if (!path.includes(emptyIndex)) letters[emptyIndex] = entry.word[Math.floor(Math.random() * entry.word.length)];
    }

    round = { entry, size, path, letters, judgmentAttempts: 0 };
    save.current = entry.word;
    save.rounds += reshuffle ? 0 : 1;
    persist();
    renderRound();
  }

  function generatePath(size, length) {
    const neighbors = index => {
      const row = Math.floor(index / size);
      const col = index % size;
      const list = [];
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (!dr && !dc) continue;
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < size && c >= 0 && c < size) list.push(r * size + c);
        }
      }
      return list;
    };

    for (let attempt = 0; attempt < 250; attempt += 1) {
      const path = [Math.floor(Math.random() * size * size)];
      while (path.length < length) {
        const options = neighbors(path[path.length - 1]).filter(index => !path.includes(index));
        if (!options.length) break;
        options.sort(() => Math.random() - .5);
        path.push(options[0]);
      }
      if (path.length === length) return path;
    }
    return Array.from({ length }, (_, index) => index);
  }

  function renderRound() {
    clearSelection();
    hideHint();
    solvedLock = false;
    const stage = getStage();
    els.board.style.setProperty("--size", round.size);
    els.board.innerHTML = round.letters.map((letter, index) =>
      `<button class="letter" type="button" role="gridcell" data-cell="${index}" data-index="${String(index + 1).padStart(2, "0")}" aria-label="${letter}">${letter}</button>`
    ).join("");
    els.folio.textContent = `ENTRY № ${String(save.completed.length + 1).padStart(3, "0")}`;
    els.targetWord.innerHTML = stage.tier === 1
      ? round.entry.word
      : round.entry.word.split("").map((letter, index) => index === 0 || index === round.entry.word.length - 1 ? letter : `<span class="mask">·</span>`).join("");
    document.getElementById("roundTitle").textContent = stage.title;
    els.gestureNote.textContent = stage.tier === 1
      ? "Hold the first letter and slide · rows, columns and diagonals all work"
      : `First and last letters are given · ${round.entry.word.length} letters in all`;
    bindCells();
    requestAnimationFrame(resizeSvg);
    updateHUD();
  }

  function bindCells() {
    els.board.querySelectorAll(".letter").forEach(cell => {
      cell.addEventListener("pointerdown", event => {
        if (solvedLock) return;
        event.preventDefault();
        dragging = true;
        clearSelection();
        addCell(Number(cell.dataset.cell));
        try { els.board.setPointerCapture(event.pointerId); } catch { /* pointer capture is optional */ }
      });
      cell.addEventListener("click", () => {
        if (solvedLock || dragging) return;
        const index = Number(cell.dataset.cell);
        if (!selection.length) addCell(index);
        else if (selection.at(-1) === index) finishSelection();
        else addCell(index);
      });
    });
    els.board.onpointermove = event => {
      if (!dragging || solvedLock) return;
      const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest?.(".letter");
      if (cell && els.board.contains(cell)) addCell(Number(cell.dataset.cell));
    };
    els.board.onpointerup = () => {
      if (!dragging) return;
      dragging = false;
      finishSelection();
    };
    els.board.onpointercancel = () => { dragging = false; clearSelection(); };
  }

  function isAdjacent(a, b) {
    const ar = Math.floor(a / round.size), ac = a % round.size;
    const br = Math.floor(b / round.size), bc = b % round.size;
    return Math.max(Math.abs(ar - br), Math.abs(ac - bc)) === 1;
  }

  function addCell(index) {
    if (selection.includes(index)) {
      if (selection.length > 1 && selection.at(-2) === index) {
        selection.pop();
        paintSelection();
      }
      return;
    }
    if (selection.length && !isAdjacent(selection.at(-1), index)) return;
    selection.push(index);
    sound.letter(selection.length);
    paintSelection();
    if (!dragging && selection.length === round.entry.word.length) finishSelection();
  }

  function paintSelection() {
    els.board.querySelectorAll(".letter").forEach((cell, index) => cell.classList.toggle("selected", selection.includes(index)));
    els.selectionText.textContent = selection.length ? selection.map(index => round.letters[index]).join("") : "—";
    drawPath(selection, false);
  }

  function finishSelection() {
    const attempt = selection.map(index => round.letters[index]).join("");
    if (attempt === round.entry.word) {
      solvedLock = true;
      window.setTimeout(solveRound, 230);
    } else if (selection.length) {
      sound.invalid();
      els.board.animate([
        { transform: "translateX(0)" }, { transform: "translateX(-7px)" },
        { transform: "translateX(7px)" }, { transform: "translateX(0)" }
      ], { duration: 250 });
      showToast(attempt.length < round.entry.word.length ? "Not finished yet — keep suspecting the letters." : "That definition does not fool the Devil.");
      window.setTimeout(clearSelection, 300);
    }
  }

  function solveRound() {
    sound.word();
    if (round.entry.tier === 2 && JUDGMENT_DECOYS[round.entry.word]) {
      openJudgment();
      return;
    }
    const result = completeEntry();
    openDefinition(result.isNew);
    if (result.currentCoins > result.previousCoins) {
      window.setTimeout(() => celebrateCoin(result.currentCoins), 650);
    }
  }

  function completeEntry() {
    const previousCoins = Math.floor(save.completed.length / 5);
    const isNew = !save.completed.includes(round.entry.word);
    if (isNew) save.completed.push(round.entry.word);
    save.order.push(round.entry.word);
    save.order = save.order.slice(-20);
    const currentCoins = Math.floor(save.completed.length / 5);
    persist();
    updateHUD();
    return { isNew, previousCoins, currentCoins };
  }

  function openDefinition(isNew) {
    els.definitionModal.classList.remove("judging");
    els.definitionWord.textContent = round.entry.word;
    els.definitionPos.textContent = round.entry.pos;
    els.definitionText.textContent = round.entry.en;
    els.judgmentPrompt.hidden = true;
    els.definitionChoices.hidden = true;
    els.judgmentFeedback.hidden = true;
    els.definitionReveal.hidden = false;
    els.definitionReveal.classList.remove("judgment-result");
    els.readerNote.hidden = true;
    els.nextButton.hidden = false;
    els.nextButton.textContent = save.completed.length === 15 && round.entry.tier === 1
      ? "ENTER STAGE II · THE JUDGMENT"
      : "BIND IT IN · NEXT WORD";
    els.newEntryBadge.textContent = isNew ? "NEW ENTRY" : "REVISITED";
    els.modalProgress.textContent = `${save.completed.length} / ${ENTRIES.length} COLLECTED`;
    openModal(els.nextButton);
  }

  function openJudgment() {
    window.setTimeout(() => sound.judgment(), 90);
    const choices = shuffle([
      { bias: "TRUTH", correct: true, en: round.entry.en },
      ...JUDGMENT_DECOYS[round.entry.word]
    ]);
    els.definitionModal.classList.add("judging");
    els.definitionWord.textContent = round.entry.word;
    els.definitionPos.textContent = round.entry.pos;
    els.definitionText.textContent = round.entry.en;
    els.judgmentPrompt.hidden = false;
    els.definitionChoices.hidden = false;
    els.definitionChoices.classList.remove("resolved");
    els.definitionChoices.innerHTML = choices.map(choice => `
      <button class="definition-choice" type="button" data-bias="${choice.bias}" data-correct="${choice.correct === true}">
        <strong>${choice.en}</strong>
      </button>
    `).join("");
    els.judgmentFeedback.hidden = true;
    els.judgmentFeedback.className = "judgment-feedback";
    els.definitionReveal.hidden = true;
    els.definitionReveal.classList.remove("judgment-result");
    els.readerNote.hidden = true;
    els.nextButton.hidden = true;
    els.nextButton.textContent = "ACCEPT THE VERDICT · NEXT WORD";
    els.newEntryBadge.textContent = "AWAITING VERDICT";
    els.modalProgress.textContent = `${save.completed.length} COLLECTED · VERDICT PENDING`;
    els.definitionChoices.querySelectorAll(".definition-choice").forEach(button => {
      button.addEventListener("click", () => judgeDefinition(button));
    });
    openModal(els.definitionChoices.querySelector(".definition-choice"));
  }

  function judgeDefinition(button) {
    if (els.definitionChoices.classList.contains("resolved") || button.disabled) return;
    const correct = button.dataset.correct === "true";
    const bias = button.dataset.bias;
    if (!correct) {
      sound.rejected();
      round.judgmentAttempts += 1;
      round.lastBias = bias;
      save.judgment[bias.toLowerCase()] += 1;
      persist();
      button.disabled = true;
      button.classList.add("rejected");
      els.judgmentFeedback.hidden = false;
      els.judgmentFeedback.className = "judgment-feedback wrong";
      els.judgmentFeedback.textContent = bias === "COMFORT"
        ? "DICTIONARY RECORD: You chose comfort. You wanted the word to be kind more than you wanted it to be true."
        : "DICTIONARY RECORD: You chose order. You still believe the definition printed in the manual favors no one.";
      const nextChoice = [...els.definitionChoices.querySelectorAll(".definition-choice")].find(choice => !choice.disabled);
      nextChoice?.focus();
      return;
    }

    sound.truth();
    save.judgment.correct += 1;
    if (round.judgmentAttempts === 0) save.judgment.firstTry += 1;
    button.classList.add("correct");
    els.definitionChoices.classList.add("resolved");
    els.definitionChoices.querySelectorAll(".definition-choice").forEach(choice => { choice.disabled = true; });
    els.judgmentFeedback.hidden = false;
    els.judgmentFeedback.className = "judgment-feedback right";
    els.judgmentFeedback.textContent = "VERDICT STANDS: A real definition does not explain the word. It exposes the person using it.";
    els.definitionReveal.hidden = false;
    els.definitionReveal.classList.add("judgment-result");
    els.readerNote.hidden = false;
    els.readerNote.textContent = getReaderNote();

    const result = completeEntry();
    els.newEntryBadge.textContent = result.isNew ? "VERDICT SEALED" : "REVISITED";
    els.modalProgress.textContent = `${save.completed.length} / ${ENTRIES.length} COLLECTED`;
    els.nextButton.hidden = false;
    window.setTimeout(() => els.nextButton.focus(), 420);
    if (result.currentCoins > result.previousCoins) {
      window.setTimeout(() => celebrateCoin(result.currentCoins), 650);
    }
  }

  function getReaderNote() {
    if (round.judgmentAttempts === 0) {
      return "READER'S NOTE: You picked the most uncomfortable answer on the first try. The dictionary remains wary of you.";
    }
    if (round.lastBias === "COMFORT") {
      return "READER'S NOTE: You believed the comfort first, and the truth second. Very human of you.";
    }
    return "READER'S NOTE: You believed the order first, and the truth second. The institutions will miss you.";
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function openModal(focusTarget) {
    els.definitionModal.classList.add("open");
    els.definitionModal.setAttribute("aria-hidden", "false");
    window.setTimeout(() => focusTarget?.focus(), 480);
  }

  function nextRound() {
    const unlockJudgment = save.completed.length === 15 && round.entry.tier === 1;
    els.definitionModal.classList.remove("open");
    els.definitionModal.classList.remove("judging");
    els.definitionModal.setAttribute("aria-hidden", "true");
    const next = pickEntry();
    if (unlockJudgment) {
      sound.stage();
      els.stageCurtain.classList.add("show");
      els.stageCurtain.setAttribute("aria-hidden", "false");
      window.setTimeout(() => {
        els.stageCurtain.classList.remove("show");
        els.stageCurtain.setAttribute("aria-hidden", "true");
        makeBoard(next);
      }, 2350);
      return;
    }
    sound.page();
    window.setTimeout(() => makeBoard(next), 250);
  }

  function updateHUD() {
    const count = save.completed.length;
    const coins = Math.floor(count / 5);
    const within = count % 5;
    const remaining = within === 0 ? 5 : 5 - within;
    els.coinCount.textContent = coins;
    els.completedCount.textContent = count;
    els.totalCount.textContent = ENTRIES.length;
    els.progressFill.style.width = `${Math.min(100, count / ENTRIES.length * 100)}%`;
    els.stageName.textContent = getStage(count).name;
    els.coinRuleText.textContent = count === ENTRIES.length ? "The whole dictionary has been conquered" : `${remaining} ${remaining === 1 ? "word" : "words"} to go`;
    els.coinPips.innerHTML = Array.from({ length: 5 }, (_, index) => `<i class="pip ${index < within ? "filled" : ""}"></i>`).join("");
    els.coinVault.setAttribute("aria-label", `${coins} Devil Coins held. One coin is minted for every 5 different entries completed.`);
    const soundOn = save.sound !== false;
    els.soundToggle.classList.toggle("muted", !soundOn);
    els.soundToggle.setAttribute("aria-pressed", String(soundOn));
    els.soundToggle.setAttribute("aria-label", soundOn ? "Mute sound" : "Unmute sound");
  }

  function toggleSound() {
    if (save.sound !== false) {
      sound.disabled();
      save.sound = false;
    } else {
      save.sound = true;
      sound.enabled();
    }
    persist();
    updateHUD();
    showToast(save.sound ? "Sound has returned to the dictionary." : "The dictionary keeps its silence now." );
  }

  function showHint() {
    sound.hint();
    save.hints += 1;
    persist();
    clearSelection();
    els.board.querySelectorAll(".letter").forEach((cell, index) => cell.classList.toggle("hint-node", round.path.includes(index)));
    drawPath(round.path, true);
    els.hintButton.textContent = "The trail is showing";
    clearTimeout(hintTimer);
    hintTimer = window.setTimeout(hideHint, 3600);
  }

  function hideHint() {
    clearTimeout(hintTimer);
    els.board.querySelectorAll(".letter").forEach(cell => cell.classList.remove("hint-node"));
    if (!selection.length) els.pathLayer.innerHTML = "";
    els.hintButton.innerHTML = '<span aria-hidden="true">⌁</span> SHOW THE DOTTED TRAIL';
  }

  function drawPath(indices, hint) {
    resizeSvg();
    if (indices.length < 2) { els.pathLayer.innerHTML = ""; return; }
    const boardBox = els.board.getBoundingClientRect();
    const points = indices.map(index => {
      const box = els.board.children[index].getBoundingClientRect();
      return `${box.left - boardBox.left + box.width / 2},${box.top - boardBox.top + box.height / 2}`;
    }).join(" ");
    els.pathLayer.innerHTML = `<polyline class="path-line ${hint ? "hint" : ""}" points="${points}"></polyline>`;
  }

  function resizeSvg() {
    const box = els.board.getBoundingClientRect();
    els.pathLayer.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  }

  function clearSelection() {
    selection = [];
    els.selectionText.textContent = "—";
    els.board?.querySelectorAll(".letter").forEach(cell => cell.classList.remove("selected"));
    els.pathLayer.innerHTML = "";
  }

  function celebrateCoin(total) {
    sound.coin();
    els.coinMilestone.textContent = `${total * 5} different entries completed · ${total} in all`;
    els.coinCelebration.classList.remove("show");
    void els.coinCelebration.offsetWidth;
    els.coinCelebration.classList.add("show");
    els.coinCelebration.setAttribute("aria-hidden", "false");
    window.setTimeout(() => els.coinCelebration.setAttribute("aria-hidden", "true"), 2800);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("show");
    toastTimer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function resetProgress() {
    const firstClick = els.resetButton.dataset.confirm !== "yes";
    if (firstClick) {
      els.resetButton.dataset.confirm = "yes";
      els.resetButton.textContent = "TAP AGAIN TO CONFIRM RESET";
      showToast("Every entry and every coin will be wiped.");
      window.setTimeout(() => {
        els.resetButton.dataset.confirm = "";
        els.resetButton.textContent = "RESET MY PROGRESS";
      }, 3500);
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    save = loadSave();
    els.resetButton.dataset.confirm = "";
    els.resetButton.textContent = "RESET MY PROGRESS";
    makeBoard(pickEntry());
    showToast("A new dictionary has been opened.");
  }

  function init() {
    els.totalCount.textContent = ENTRIES.length;
    updateHUD();
    const current = ENTRIES.find(entry => entry.word === save.current && !save.completed.includes(entry.word));
    makeBoard(current || pickEntry());
    els.hintButton.addEventListener("click", showHint);
    els.shuffleButton.addEventListener("click", () => { sound.shuffle(); makeBoard(round.entry, true); showToast("Same word. The lies have been rearranged."); });
    els.nextButton.addEventListener("click", nextRound);
    els.coinVault.addEventListener("click", () => { sound.coinTap(); showToast("Every 5 different entries completed resets the count and mints one more coin."); });
    els.soundToggle.addEventListener("click", toggleSound);
    els.resetButton.addEventListener("click", resetProgress);
    window.addEventListener("resize", () => requestAnimationFrame(() => drawPath(selection, false)));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && els.definitionModal.classList.contains("open") && !els.nextButton.hidden) nextRound();
    });
    window.__DEVILS_GAME__ = {
      entries: ENTRIES,
      getState: () => ({ ...save, coins: Math.floor(save.completed.length / 5), round: round ? { ...round } : null }),
      solveCurrent: () => { selection = [...round.path]; paintSelection(); finishSelection(); },
      reset: () => { localStorage.removeItem(STORAGE_KEY); location.reload(); }
    };
  }

  init();
})();
