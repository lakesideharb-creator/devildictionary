(() => {
  "use strict";

  const ENTRIES = [
    { word: "EGO", pos: "noun", en: "The pocket mirror in which the universe is expected to admire itself.", cn: "一面随身镜，宇宙被要求每天从里面欣赏你。", tier: 1 },
    { word: "HOPE", pos: "noun", en: "A loan taken from tomorrow, with no intention of reading the interest rate.", cn: "向明天借的一笔钱——签字时通常没人看利率。", tier: 1 },
    { word: "LUCK", pos: "noun", en: "Skill, as described by its beneficiary; injustice, as described by everyone else.", cn: "受益者称它为本事，旁观者称它为不公。", tier: 1 },
    { word: "BOSS", pos: "noun", en: "One who arrives late because time reports to them.", cn: "一个迟到的人——因为时间归他管理。", tier: 1 },
    { word: "RULE", pos: "noun", en: "A fence built by those already standing on the pleasant side.", cn: "已经站在风景那边的人，修给后来者的一道篱笆。", tier: 1 },
    { word: "FAME", pos: "noun", en: "The punishment of being recognized by people you would never recognize.", cn: "被一群你认不出来的人认出来的惩罚。", tier: 1 },
    { word: "DUTY", pos: "noun", en: "A desire that has learned to wear someone else’s uniform.", cn: "一种穿上别人制服的欲望。", tier: 1 },
    { word: "TASTE", pos: "noun", en: "An opinion wealthy enough to hire confidence.", cn: "一种雇得起自信的意见。", tier: 1 },
    { word: "TRUTH", pos: "noun", en: "A fact that survived the meeting where the story was approved.", cn: "一个从‘统一口径会’里侥幸活下来的事实。", tier: 1 },
    { word: "SMILE", pos: "noun", en: "A curve that conceals the shortest distance between two suspicions.", cn: "一条曲线，用来隐藏两份猜疑之间最短的距离。", tier: 1 },
    { word: "SLEEP", pos: "noun", en: "A rehearsal for death, interrupted daily by invoices.", cn: "死亡的彩排，每天都被账单叫停。", tier: 1 },
    { word: "MONEY", pos: "noun", en: "A universal language in which everyone develops an accent near the bill.", cn: "一种世界语；账单出现时，每个人都会忽然带口音。", tier: 1 },
    { word: "ADVICE", pos: "noun", en: "A gift whose receipt is kept longer than its contents.", cn: "一种礼物：收据往往比内容保存得更久。", tier: 1 },
    { word: "FRIEND", pos: "noun", en: "A witness for the defense who has read the prosecution’s notes.", cn: "一位替你辩护、但读过控方笔记的证人。", tier: 1 },
    { word: "HONEST", pos: "adj.", en: "Temporarily unable to calculate the profitable answer.", cn: "暂时还没算出哪个答案更赚钱。", tier: 1 },

    { word: "CAREER", pos: "noun", en: "A ladder that becomes a treadmill one promotion at a time.", cn: "一架梯子，每升一级，就更像一台跑步机。", tier: 2 },
    { word: "EXPERT", pos: "noun", en: "A person who knows exactly why yesterday’s certainty failed.", cn: "一个精确知道昨天的确定性为何失败的人。", tier: 2 },
    { word: "STATUS", pos: "noun", en: "The altitude at which one begins mistaking thin air for applause.", cn: "一种高度；到了那里，人会把稀薄空气误听成掌声。", tier: 2 },
    { word: "POLITE", pos: "adj.", en: "Skilled at wrapping contempt so the recipient thanks you for the parcel.", cn: "擅长把轻蔑包成礼物，让收件人还向你道谢。", tier: 2 },
    { word: "REGRET", pos: "noun", en: "Wisdom that arrives after the witnesses have gone home.", cn: "一种在证人都回家之后才抵达的智慧。", tier: 2 },
    { word: "SECRET", pos: "noun", en: "Information told to one person at a time until everyone is trustworthy.", cn: "一种每次只告诉一个人的消息，直到所有人都变得可信。", tier: 2 },
    { word: "MEETING", pos: "noun", en: "A ceremony in which minutes are kept and hours are lost.", cn: "一种保存‘分钟’、遗失‘小时’的仪式。", tier: 2 },
    { word: "SUCCESS", pos: "noun", en: "The moment your old mistakes acquire biographers.", cn: "当你过去的错误终于有了传记作者。", tier: 2 },
    { word: "NORMAL", pos: "adj.", en: "Common enough to escape examination.", cn: "因为足够常见，所以逃过了审问。", tier: 2 },
    { word: "PROMISE", pos: "noun", en: "A future fact still protected from evidence.", cn: "一件尚未遭遇证据、因而安全的未来事实。", tier: 2 },
    { word: "LOYALTY", pos: "noun", en: "The virtue of remembering which side currently signs the checks.", cn: "一种记得目前由哪一方签支票的美德。", tier: 2 },
    { word: "REPUTE", pos: "noun", en: "A shadow that complains whenever its owner changes direction.", cn: "一团影子，主人每次转身，它都要抱怨。", tier: 2 },
    { word: "CHOICE", pos: "noun", en: "The freedom to select which consequence will later feel imposed.", cn: "选择哪一种后果，将来可以抱怨是被强加的自由。", tier: 2 },
    { word: "MATURE", pos: "adj.", en: "Too experienced to be surprised, too tired to be impressed.", cn: "经验多到不会吃惊，疲惫多到不会佩服。", tier: 2 },
    { word: "JUSTICE", pos: "noun", en: "A balance admired most by those holding the weights.", cn: "一架天平，最欣赏它的人通常正拿着砝码。", tier: 2 },

    { word: "AMBITION", pos: "noun", en: "The art of climbing a ladder while explaining that height is vulgar.", cn: "一边爬梯子，一边解释高度很庸俗的艺术。", tier: 3 },
    { word: "CONSENSUS", pos: "noun", en: "A conclusion everyone can defend because nobody remembers proposing it.", cn: "一个人人都能捍卫的结论，因为没人记得是谁提的。", tier: 3 },
    { word: "PROGRESS", pos: "noun", en: "Replacing an old inconvenience with one that requires a password.", cn: "用一种需要密码的新麻烦，替换旧麻烦。", tier: 3 },
    { word: "INNOCENT", pos: "adj.", en: "Not yet supplied with a sufficiently detailed accusation.", cn: "尚未收到一份足够详尽的指控。", tier: 3 },
    { word: "EDUCATION", pos: "noun", en: "The discovery that ignorance can be itemized and financed.", cn: "发现无知原来可以分科计价、分期付款。", tier: 3 },
    { word: "TRADITION", pos: "noun", en: "A dead person’s vote in a living person’s decision.", cn: "死人在活人的决定里投下的一票。", tier: 3 },
    { word: "AUTHORITY", pos: "noun", en: "Confidence backed by furniture, a title, and a locked door.", cn: "由家具、头衔和一扇上锁的门担保的自信。", tier: 3 },
    { word: "ORIGINAL", pos: "adj.", en: "Copied from a source the audience has not yet discovered.", cn: "抄自一个观众尚未发现的来源。", tier: 3 },
    { word: "STRATEGY", pos: "noun", en: "A story explaining why the accident was always the destination.", cn: "一个用来说明意外其实一直都是目的地的故事。", tier: 3 },
    { word: "CERTAINTY", pos: "noun", en: "Doubt promoted beyond its competence.", cn: "一份被提拔到超出能力范围的怀疑。", tier: 3 },
    { word: "PATIENCE", pos: "noun", en: "The noble name we give to waiting when leaving is expensive.", cn: "当离开太贵时，我们给等待起的高贵名字。", tier: 3 },
    { word: "PRINCIPLE", pos: "noun", en: "A rule kept most firmly when it costs someone else.", cn: "一种规则：代价由别人支付时，我们坚持得最牢。", tier: 3 },
    { word: "CULTURE", pos: "noun", en: "What remains after a group forgets why it began behaving that way.", cn: "一群人忘了为何那样做之后，留下来的东西。", tier: 3 },
    { word: "NETWORK", pos: "noun", en: "Friendship measured in future usefulness.", cn: "用未来用途计量的友谊。", tier: 3 },
    { word: "LEGACY", pos: "noun", en: "An argument with the future conducted by someone unable to hear the reply.", cn: "一个听不见回答的人，与未来进行的争论。", tier: 3 }
  ];

  const JUDGMENT_DECOYS = {
    CAREER: [
      { bias: "COMFORT", en: "A professional path through which effort becomes expertise and leadership.", cn: "一条让努力逐渐变成专业与领导力的职业道路。" },
      { bias: "ORDER", en: "A sequence of roles shaped by skill, opportunity, and persistence.", cn: "由能力、机会与坚持共同塑造的一系列职位。" }
    ],
    EXPERT: [
      { bias: "COMFORT", en: "Someone whose specialized knowledge makes uncertain decisions more reliable.", cn: "用专业知识让不确定的决定变得更可靠的人。" },
      { bias: "ORDER", en: "A professional recognized by peers for mastering a narrow field.", cn: "因精通某个细分领域而获得同行认可的专业人士。" }
    ],
    STATUS: [
      { bias: "COMFORT", en: "A position earned when achievement becomes visible to others.", cn: "当成就终于被他人看见时获得的位置。" },
      { bias: "ORDER", en: "A social rank that organizes responsibility, influence, and respect.", cn: "用来安排责任、影响力与尊重的社会等级。" }
    ],
    POLITE: [
      { bias: "COMFORT", en: "Showing consideration for others through tact and restraint.", cn: "通过克制与分寸表达对他人的体谅。" },
      { bias: "ORDER", en: "Following the social rules that allow strangers to coexist smoothly.", cn: "遵守让陌生人得以顺畅相处的社会规则。" }
    ],
    REGRET: [
      { bias: "COMFORT", en: "Pain caused by wishing a past decision had been different.", cn: "希望过去的决定有所不同时产生的痛苦。" },
      { bias: "ORDER", en: "Evidence that conscience has examined experience and learned from it.", cn: "良知审视经验并从中学习的证据。" }
    ],
    SECRET: [
      { bias: "COMFORT", en: "Information protected because disclosure would cause unnecessary harm.", cn: "因公开会造成不必要伤害而受到保护的信息。" },
      { bias: "ORDER", en: "A confidence shared only with those entitled to know it.", cn: "只与有资格知情的人分享的隐秘。" }
    ],
    MEETING: [
      { bias: "COMFORT", en: "A scheduled discussion where a group turns many views into one decision.", cn: "让一群人把多种观点变成一个决定的定期讨论。" },
      { bias: "ORDER", en: "A formal gathering for exchanging information and assigning action.", cn: "用于交换信息并分配行动的正式集会。" }
    ],
    SUCCESS: [
      { bias: "COMFORT", en: "The achievement of a meaningful goal through sustained effort.", cn: "通过持续努力实现一个有意义的目标。" },
      { bias: "ORDER", en: "A favorable outcome recognized by oneself, one’s peers, or society.", cn: "获得自己、同行或社会承认的有利结果。" }
    ],
    NORMAL: [
      { bias: "COMFORT", en: "Belonging comfortably within the healthy range of human difference.", cn: "舒适地处在人类差异的健康范围之内。" },
      { bias: "ORDER", en: "Conforming to the pattern most commonly observed in a population.", cn: "符合一个群体中最常被观察到的模式。" }
    ],
    PROMISE: [
      { bias: "COMFORT", en: "An assurance given so another person may safely rely on you.", cn: "为了让另一个人可以安心依赖你而给出的保证。" },
      { bias: "ORDER", en: "A commitment that binds future conduct to words spoken in the present.", cn: "用现在说出的话约束未来行为的承诺。" }
    ],
    LOYALTY: [
      { bias: "COMFORT", en: "Steadfast support maintained through difficulty and change.", cn: "在困难与变化之中仍然保持的坚定支持。" },
      { bias: "ORDER", en: "A durable allegiance created by trust, duty, or shared identity.", cn: "由信任、责任或共同身份建立的持久归属。" }
    ],
    REPUTE: [
      { bias: "COMFORT", en: "The respect accumulated when character remains consistent over time.", cn: "品格长期保持一致时积累起来的尊重。" },
      { bias: "ORDER", en: "The public estimate of a person formed from past conduct.", cn: "公众依据一个人过去行为形成的评价。" }
    ],
    CHOICE: [
      { bias: "COMFORT", en: "The power to select the path that best reflects one’s values.", cn: "选择最能体现自身价值之道路的权力。" },
      { bias: "ORDER", en: "A decision made after comparing the available alternatives.", cn: "比较现有选项之后作出的决定。" }
    ],
    MATURE: [
      { bias: "COMFORT", en: "Able to meet complexity with perspective, patience, and self-command.", cn: "能够以远见、耐心和自制面对复杂处境。" },
      { bias: "ORDER", en: "Having reached the expected level of emotional and intellectual development.", cn: "达到预期的情绪与智力发展水平。" }
    ],
    JUSTICE: [
      { bias: "COMFORT", en: "The fair protection of each person’s dignity, rights, and due reward.", cn: "公平保护每个人的尊严、权利与应得回报。" },
      { bias: "ORDER", en: "The impartial application of rules to comparable acts and disputes.", cn: "对相似行为与争议不偏不倚地适用规则。" }
    ]
  };

  const STORAGE_KEY = "devils-dictionary-save-v3";
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const els = Object.fromEntries([
    "board", "pathLayer", "selectionText", "targetWord", "folio", "hintButton", "shuffleButton",
    "coinCount", "completedCount", "totalCount", "progressFill", "coinPips", "coinRuleText",
    "stageName", "definitionModal", "definitionWord", "definitionPos", "definitionText", "definitionCn",
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
    if (count < 15) return { tier: 1, name: "第一阶段 · 识字者", size: 5, title: "Find the word" };
    if (count < 30) return { tier: 2, name: "第二阶段 · 怀疑者", size: 6, title: "Read between the letters" };
    return { tier: 3, name: "第三阶段 · 共谋者", size: 7, title: "The definition is watching" };
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
      ? "从第一个字母按住滑动 · 横、竖、斜向均可"
      : `首尾字母已给出 · 共 ${round.entry.word.length} 个字母`;
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
      showToast(attempt.length < round.entry.word.length ? "还没拼完——继续怀疑字母。" : "这个定义还骗不过恶魔。");
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
    els.definitionCn.textContent = round.entry.cn;
    els.judgmentPrompt.hidden = true;
    els.definitionChoices.hidden = true;
    els.judgmentFeedback.hidden = true;
    els.definitionReveal.hidden = false;
    els.definitionReveal.classList.remove("judgment-result");
    els.readerNote.hidden = true;
    els.nextButton.hidden = false;
    els.nextButton.textContent = save.completed.length === 15 && round.entry.tier === 1
      ? "进入第二阶段 · 定义审判"
      : "收进辞典 · 下一词";
    els.newEntryBadge.textContent = isNew ? "NEW ENTRY" : "REVISITED";
    els.modalProgress.textContent = `${save.completed.length} / ${ENTRIES.length} COLLECTED`;
    openModal(els.nextButton);
  }

  function openJudgment() {
    window.setTimeout(() => sound.judgment(), 90);
    const choices = shuffle([
      { bias: "TRUTH", correct: true, en: round.entry.en, cn: round.entry.cn },
      ...JUDGMENT_DECOYS[round.entry.word]
    ]);
    els.definitionModal.classList.add("judging");
    els.definitionWord.textContent = round.entry.word;
    els.definitionPos.textContent = round.entry.pos;
    els.definitionText.textContent = round.entry.en;
    els.definitionCn.textContent = round.entry.cn;
    els.judgmentPrompt.hidden = false;
    els.definitionChoices.hidden = false;
    els.definitionChoices.classList.remove("resolved");
    els.definitionChoices.innerHTML = choices.map(choice => `
      <button class="definition-choice" type="button" data-bias="${choice.bias}" data-correct="${choice.correct === true}">
        <strong>${choice.en}</strong>
        <small>${choice.cn}</small>
      </button>
    `).join("");
    els.judgmentFeedback.hidden = true;
    els.judgmentFeedback.className = "judgment-feedback";
    els.definitionReveal.hidden = true;
    els.definitionReveal.classList.remove("judgment-result");
    els.readerNote.hidden = true;
    els.nextButton.hidden = true;
    els.nextButton.textContent = "接受判词 · 下一词";
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
        ? "辞典记录：你选择了安慰。你希望词语善良，胜过希望它准确。"
        : "辞典记录：你选择了秩序。你仍相信写进手册的定义不会偏袒任何人。";
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
    els.judgmentFeedback.textContent = "判决成立：真正的定义不是解释这个词，而是揭穿使用这个词的人。";
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
      return "读者注释：你第一次就选择了最不舒服的答案。辞典暂时对你保持警惕。";
    }
    if (round.lastBias === "COMFORT") {
      return "读者注释：你先相信了安慰，后来才相信真相。很有人性。";
    }
    return "读者注释：你先相信了秩序，后来才相信真相。制度会想念你的。";
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
    els.coinRuleText.textContent = count === ENTRIES.length ? "全辞典已征服" : `还需 ${remaining} 词`;
    els.coinPips.innerHTML = Array.from({ length: 5 }, (_, index) => `<i class="pip ${index < within ? "filled" : ""}"></i>`).join("");
    els.coinVault.setAttribute("aria-label", `当前 ${coins} 枚金币。每完成 5 个不同词条获得 1 枚。`);
    const soundOn = save.sound !== false;
    els.soundToggle.classList.toggle("muted", !soundOn);
    els.soundToggle.setAttribute("aria-pressed", String(soundOn));
    els.soundToggle.setAttribute("aria-label", soundOn ? "关闭音效" : "开启音效");
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
    showToast(save.sound ? "声音回到了辞典里。" : "辞典现在保持沉默。" );
  }

  function showHint() {
    sound.hint();
    save.hints += 1;
    persist();
    clearSelection();
    els.board.querySelectorAll(".letter").forEach((cell, index) => cell.classList.toggle("hint-node", round.path.includes(index)));
    drawPath(round.path, true);
    els.hintButton.textContent = "虚线已现形";
    clearTimeout(hintTimer);
    hintTimer = window.setTimeout(hideHint, 3600);
  }

  function hideHint() {
    clearTimeout(hintTimer);
    els.board.querySelectorAll(".letter").forEach(cell => cell.classList.remove("hint-node"));
    if (!selection.length) els.pathLayer.innerHTML = "";
    els.hintButton.innerHTML = '<span aria-hidden="true">⌁</span> 显示虚线提示';
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
    els.coinMilestone.textContent = `完成 ${total * 5} 个不同词条 · 共 ${total} 枚`;
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
      els.resetButton.textContent = "再点一次确认重置";
      showToast("所有词条与金币都会清零。");
      window.setTimeout(() => {
        els.resetButton.dataset.confirm = "";
        els.resetButton.textContent = "重置私人进度";
      }, 3500);
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    save = loadSave();
    els.resetButton.dataset.confirm = "";
    els.resetButton.textContent = "重置私人进度";
    makeBoard(pickEntry());
    showToast("新的一本辞典已经打开。");
  }

  function init() {
    els.totalCount.textContent = ENTRIES.length;
    updateHUD();
    const current = ENTRIES.find(entry => entry.word === save.current && !save.completed.includes(entry.word));
    makeBoard(current || pickEntry());
    els.hintButton.addEventListener("click", showHint);
    els.shuffleButton.addEventListener("click", () => { sound.shuffle(); makeBoard(round.entry, true); showToast("词没变，谎言换了位置。"); });
    els.nextButton.addEventListener("click", nextRound);
    els.coinVault.addEventListener("click", () => { sound.coinTap(); showToast("每完成 5 个不同词条，金币总数自动校准 +1。"); });
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
