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
    { word: "LEGACY", pos: "noun", en: "An argument with the future conducted by someone unable to hear the reply.", tier: 3 },
    { word: "YEAR", pos: "noun", en: "A period of three hundred and sixty-five disappointments.", tier: 1 },
    { word: "BACK", pos: "noun", en: "That part of your friend which it is your privilege to contemplate in your adversity.", tier: 1 },
    { word: "VOTE", pos: "noun", en: "The instrument and symbol of a freeman’s power to make a fool of himself and a wreck of his country.", tier: 1 },
    { word: "PLAN", pos: "verb-transitive", en: "To bother about the best method of accomplishing an accidental result.", tier: 1 },
    { word: "PRICE", pos: "noun", en: "Value, plus a reasonable sum for the wear and tear of conscience in demanding it.", tier: 1 },
    { word: "FAITH", pos: "noun", en: "Belief without evidence in what is told by one who speaks without knowledge, of things without parallel.", tier: 1 },
    { word: "NOISE", pos: "noun", en: "A stench in the ear. Undomesticated music. The chief product and authenticating sign of civilization.", tier: 1 },
    { word: "PRAY", pos: "verb", en: "To ask that the laws of the universe be annulled in behalf of a single petitioner confessedly unworthy.", tier: 1 },
    { word: "LABOR", pos: "noun", en: "One of the processes by which A acquires property for B.", tier: 1 },
    { word: "TALK", pos: "verb-transitive", en: "To commit an indiscretion without temptation, from an impulse without purpose.", tier: 1 },
    { word: "PLEASE", pos: "verb", en: "To lay the foundation for a superstructure of imposition.", tier: 2 },
    { word: "FUTURE", pos: "noun", en: "That period of time in which our affairs prosper, our friends are true and our happiness is assured.", tier: 2 },
    { word: "POLICE", pos: "noun", en: "An armed force for protection and participation.", tier: 2 },
    { word: "REASON", pos: "verb-intransitive", en: "To weigh probabilities in the scales of desire.", tier: 2 },
    { word: "BATTLE", pos: "noun", en: "A method of untying with the teeth of a political knot that would not yield to the tongue.", tier: 2 },
    { word: "SENATE", pos: "noun", en: "A body of elderly gentlemen charged with high duties and misdemeanors.", tier: 2 },
    { word: "LAWYER", pos: "noun", en: "One skilled in circumvention of the law.", tier: 2 },
    { word: "APPEAL", pos: "verb-transitive", en: "In law, to put the dice into the box for another throw.", tier: 2 },
    { word: "REFORM", pos: "verb", en: "A thing that mostly satisfies reformers opposed to reformation.", tier: 2 },
    { word: "HARBOR", pos: "noun", en: "A place where ships taking shelter from storms are exposed to the fury of the customs.", tier: 2 },
    { word: "PRIVATE", pos: "noun", en: "A military gentleman with a field-marshal’s baton in his knapsack and an impediment in his hope.", tier: 3 },
    { word: "PRESENT", pos: "noun", en: "That part of eternity dividing the domain of disappointment from the realm of hope.", tier: 3 },
    { word: "ECONOMY", pos: "noun", en: "Purchasing the barrel of whiskey that you do not need for the price of the cow that you cannot afford.", tier: 3 },
    { word: "WEDDING", pos: "noun", en: "A ceremony at which two persons undertake to become one, one undertakes to become nothing, and nothing undertakes to become supportable.", tier: 3 },
    { word: "COMFORT", pos: "noun", en: "A state of mind produced by contemplation of a neighbor’s uneasiness.", tier: 3 },
    { word: "JEALOUS", pos: "adjective", en: "Unduly concerned about the preservation of that which can be lost only if not worth keeping.", tier: 3 },
    { word: "DESTINY", pos: "noun", en: "A tyrant’s authority for crime and fool’s excuse for failure.", tier: 3 },
    { word: "GRAMMAR", pos: "noun", en: "A system of pitfalls thoughtfully prepared for the feet of the self-made man, along the path by which he advances to distinction.", tier: 3 },
    { word: "SELFISH", pos: "adjective", en: "Devoid of consideration for the selfishness of others.", tier: 3 },
    { word: "MIRACLE", pos: "noun", en: "An act or event out of the order of nature and unaccountable, as beating a normal hand of four kings and an ace with four aces and a king.", tier: 3 },
    { word: "LANGUAGE", pos: "noun", en: "The music with which we charm the serpents guarding another’s treasure.", tier: 4 },
    { word: "INSURANCE", pos: "noun", en: "An ingenious modern game of chance in which the player is permitted to enjoy the comfortable conviction that he is beating the man who keeps the table.", tier: 4 },
    { word: "LEARNING", pos: "noun", en: "The kind of ignorance distinguishing the studious.", tier: 4 },
    { word: "MARRIAGE", pos: "noun", en: "The state or condition of a community consisting of a master, a mistress and two slaves, making in all, two.", tier: 4 },
    { word: "POLITICS", pos: "noun", en: "A strife of interests masquerading as a contest of principles. The conduct of public affairs for private advantage.", tier: 4 },
    { word: "DISTANCE", pos: "noun", en: "The only thing that the rich are willing for the poor to call theirs, and keep.", tier: 4 },
    { word: "INFLUENCE", pos: "noun", en: "In politics, a visionary quo given in exchange for a substantial quid.", tier: 4 },
    { word: "MEDICINE", pos: "noun", en: "A stone flung down the Bowery to kill a dog in Broadway.", tier: 4 },
    { word: "ACCIDENT", pos: "noun", en: "An inevitable occurrence due to the action of immutable natural laws.", tier: 4 },
    { word: "HAPPINESS", pos: "noun", en: "An agreeable sensation arising from contemplating the misery of another.", tier: 4 },
    { word: "TELEPHONE", pos: "noun", en: "An invention of the devil which abrogates some of the advantages of making a disagreeable person keep his distance.", tier: 4 },
    { word: "ALLIANCE", pos: "noun", en: "In international politics, the union of two thieves who have their hands so deeply inserted in each other’s pockets that they cannot separately plunder a third.", tier: 4 },
    { word: "COMMERCE", pos: "noun", en: "A kind of transaction in which A plunders from B the goods of C, and for compensation B picks the pocket of D of money belonging to E.", tier: 4 },
    { word: "DEPENDENT", pos: "adjective", en: "Reliant upon another’s generosity for the support which you are not in a position to exact from his fears.", tier: 4 },
    { word: "DIAGNOSIS", pos: "noun", en: "A physician’s forecast of the disease by the patient’s pulse and purse.", tier: 4 },
    { word: "PHYSICIAN", pos: "noun", en: "One upon whom we set our hopes when ill and our dogs when well.", tier: 4 },
    { word: "APOLOGIZE", pos: "verb-intransitive", en: "To lay the foundation for a future offence.", tier: 4 },
    { word: "BOUNDARY", pos: "noun", en: "In political geography, an imaginary line between two nations, separating the imaginary rights of one from the imaginary rights of the other.", tier: 4 },
    { word: "NEIGHBOR", pos: "noun", en: "One whom we are commanded to love as ourselves, and who does all he knows how to make us disobedient.", tier: 4 },
    { word: "ARCHITECT", pos: "noun", en: "One who drafts a plan of your house, and plans a draft of your money.", tier: 4 },
    { word: "MERCHANT", pos: "noun", en: "One engaged in a commercial pursuit. A commercial pursuit is one in which the thing pursued is a dollar.", tier: 4 },
    { word: "RATIONAL", pos: "adjective", en: "Devoid of all delusions save those of observation, experience and reflection.", tier: 4 },
    { word: "KINDNESS", pos: "noun", en: "A brief preface to ten volumes of exaction.", tier: 4 },
    { word: "GENEROUS", pos: "adjective", en: "Originally this word meant noble by birth and was rightly applied to a great multitude of persons. It now means noble by nature and is taking a bit of a rest.", tier: 4 },
    { word: "PASSPORT", pos: "noun", en: "A document treacherously inflicted upon a citizen going abroad, exposing him as an alien and pointing him out for special reprobation and outrage.", tier: 4 },
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
    ],
    PLEASE: [
      { bias: "COMFORT", en: "A sign that something will happen if nothing happens." },
      { bias: "ORDER", en: "One who moves along the line of least reluctance to a desired death." },
    ],
    FUTURE: [
      { bias: "COMFORT", en: "An ingenious instrument which indicates what kind of weather we are having." },
      { bias: "ORDER", en: "A prestidigitator who, putting metal into your mouth, pulls coins out of your pocket." },
    ],
    POLICE: [
      { bias: "COMFORT", en: "One who has relied on the assistance of his friends." },
      { bias: "ORDER", en: "A person whose vices and follies are not sociable." },
    ],
    REASON: [
      { bias: "COMFORT", en: "To acquire, frequently by force but preferably by stealth." },
      { bias: "ORDER", en: "A means, under Providence, of withholding alms from the destitute." },
    ],
    BATTLE: [
      { bias: "COMFORT", en: "A play in which the story is told without violence to the language. The least disagreeable form of dramatic action." },
      { bias: "ORDER", en: "A sentiment appropriate to the occasion of another’s superiority." },
    ],
    SENATE: [
      { bias: "ORDER", en: "An instrument employed in the rectification of national boundaries." },
      { bias: "COMFORT", en: "A proponent of a new misrule who has failed to establish it." },
    ],
    LAWYER: [
      { bias: "COMFORT", en: "A disease incurred by exposure to the prosperity of a friend." },
      { bias: "ORDER", en: "An American sovereign in his probationary state." },
    ],
    APPEAL: [
      { bias: "COMFORT", en: "The kind of clothing worn by a man whose tailor is a blacksmith." },
      { bias: "ORDER", en: "A woman with a fine prospect of happiness behind her." },
    ],
    REFORM: [
      { bias: "COMFORT", en: "A preparation that renders the hook more palatable. The best kind is beauty." },
      { bias: "ORDER", en: "A person who talks when you wish him to listen." },
    ],
    HARBOR: [
      { bias: "COMFORT", en: "There is no definition for this word—nobody knows what hash is." },
      { bias: "ORDER", en: "To treat with merited indifference the landlord’s notification that he has let his house to a party willin’ to pay." },
    ],
    LANGUAGE: [
      { bias: "ORDER", en: "A muscular partition separating disorders of the chest from disorders of the bowels." },
      { bias: "COMFORT", en: "In literary affairs, to become the fundamental element in a cone of critics." },
    ],
    INSURANCE: [
      { bias: "ORDER", en: "In the Buddhist religion, a state of pleasurable annihilation awarded to the wise, particularly to those wise enough to understand it." },
      { bias: "COMFORT", en: "An indocile horse of the western plains. In English society, the American wife of an English nobleman." },
    ],
    LEARNING: [
      { bias: "COMFORT", en: "The Second Person of the secular Trinity." },
      { bias: "ORDER", en: "A vagrant opinion without visible means of support." },
    ],
    MARRIAGE: [
      { bias: "COMFORT", en: "An instrument of torture operated by a person with cotton in his ears. There are two instruments that are worse than a clarinet—two clarinets." },
      { bias: "ORDER", en: "A woman by whom the realm is ruled when there is a king, and through whom it is ruled when there is not." },
    ],
    POLITICS: [
      { bias: "ORDER", en: "A staff of office signifying authority. Its form, that of a heavy club, indicates its original purpose and use in dissuading from dissent." },
      { bias: "COMFORT", en: "An account of one’s descent from an ancestor who did not particularly care to trace his own." },
    ],
    DISTANCE: [
      { bias: "ORDER", en: "The chief of a nation that prefers the pestilence of despotism to the plague of anarchy." },
      { bias: "COMFORT", en: "One with his hand in your pocket, his tongue in your ear and his faith in your patience." },
    ],
    INFLUENCE: [
      { bias: "COMFORT", en: "A notable first experiment in baptism which washed away the sins (and sinners) of the world." },
      { bias: "ORDER", en: "In politics, an imaginary rat-pit in which the statesman wrestles with his record." },
    ],
    MEDICINE: [
      { bias: "COMFORT", en: "Unwarranted repose of manner in a person of low degree." },
      { bias: "ORDER", en: "The patriotic art of lying for one’s country." },
    ],
    ACCIDENT: [
      { bias: "COMFORT", en: "A kind of animal that the ancients catalogued under many heads." },
      { bias: "ORDER", en: "A device for promoting dejection. Gentle exercise for intellectual debility." },
    ],
    HAPPINESS: [
      { bias: "COMFORT", en: "One who is obstinately and zealously attached to an opinion that you do not entertain." },
      { bias: "ORDER", en: "An unenlightened person who thinks one country better than another." },
    ],
    TELEPHONE: [
      { bias: "COMFORT", en: "An instinct thoughtfully implanted by Providence as a solution to the labor question." },
      { bias: "ORDER", en: "The hair that is commonly cut off by those who justly execrate the absurd Chinese custom of shaving the head." },
    ],
    ALLIANCE: [
      { bias: "COMFORT", en: "To correct an erring friend or admonish a needy one. Of women the word abandoned is used in the sense of indiscreet." },
      { bias: "ORDER", en: "A burden which of all those that we load upon others and carry ourselves is lightest in the hands and heaviest upon the back." },
    ],
    COMMERCE: [
      { bias: "COMFORT", en: "A place where horses, ponies and elephants are permitted to see men, women and children acting the fool." },
      { bias: "ORDER", en: "In American politics, a person who having failed to secure an office from the people is given one by the Administration on condition that he leave the country." },
    ],
    DEPENDENT: [
      { bias: "COMFORT", en: "One who, professing virtues that he does not respect, secures the advantage of seeming to be what he despises." },
      { bias: "ORDER", en: "A savage beast which, when it sleeps, Man girds at and despises, But takes himself away by leaps And bounds when it arises." },
    ],
    DIAGNOSIS: [
      { bias: "ORDER", en: "The spiritual attitude of a man to a god and a dog to a man." },
      { bias: "COMFORT", en: "A person with a Caucasian body and a Mongolian soul. A Tartar Emetic." },
    ],
    PHYSICIAN: [
      { bias: "COMFORT", en: "A nutritious substance supplied by a bountiful Providence for the fattening of the poor." },
      { bias: "ORDER", en: "A form of expression peculiar to the Land beyond the Magazines." },
    ],
    APOLOGIZE: [
      { bias: "COMFORT", en: "An ox wearing the popular religious yoke." },
      { bias: "ORDER", en: "An arboreal animal which makes itself at home in genealogical trees." },
    ],
    BOUNDARY: [
      { bias: "COMFORT", en: "Sensible, madam, to the worth of this present writer. Alive, sir, to the advantages of letting him alone." },
      { bias: "ORDER", en: "A prostrating disease caused by a determination of the heart to the head. It is sometimes accompanied by a copious discharge of hydrated chloride of sodium from the eyes." },
    ],
    NEIGHBOR: [
      { bias: "COMFORT", en: "The feeling of a prudent man for an enemy who is too formidable safely to be opposed." },
      { bias: "ORDER", en: "One of the two things mainly conducive to success, especially in politics. The other is Pull." },
    ],
    ARCHITECT: [
      { bias: "ORDER", en: "A physician’s name for the rheumatism of a rich patient." },
      { bias: "COMFORT", en: "“A kind of cloth the making of which, when made of hemp, entails a great waste of hemp.”" },
    ],
    MERCHANT: [
      { bias: "COMFORT", en: "The purchase of that which neither belongs to the seller, nor can belong to the buyer. The most unprofitable of investments." },
      { bias: "ORDER", en: "One to whom the interests of a part seem superior to those of the whole. The dupe of statesmen and the tool of conquerors." },
    ],
    RATIONAL: [
      { bias: "ORDER", en: "The state of an enemy or opponent after an imaginary encounter with oneself." },
      { bias: "COMFORT", en: "The human race, collectively, exclusive of the anthropoid poets." },
    ],
    KINDNESS: [
      { bias: "COMFORT", en: "A father who has made a vow not to be a husband." },
      { bias: "ORDER", en: "An offense next in degree of enormity to a slight." },
    ],
    GENEROUS: [
      { bias: "COMFORT", en: "An animal (Porcus omnivorus) closely allied to the human race by the splendor and vivacity of its appetite, which, however, is inferior in scope, for it sticks at pig." },
      { bias: "ORDER", en: "The period of human life intermediate between the idiocy of infancy and the folly of youth—two removes from the sin of manhood and three from the remorse of age." },
    ],
    PASSPORT: [
      { bias: "COMFORT", en: "Good to eat, and wholesome to digest, as a worm to a toad, a toad to a snake, a snake to a pig, a pig to a man, and a man to a worm." },
      { bias: "ORDER", en: "The dream of a mad philosopher. That which would remain in the cupel if one should assay a phantom. The nucleus of a vacuum." },
    ],
  };

  const STORAGE_KEY = "devils-dictionary-save-v3";
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // The mobile edition gives away the first FREE_LIMIT entries and charges once for
  // the rest. The web edition has no paywall at all, so nothing here is enforced
  // unless the page is actually running inside the native shell.
  const FREE_LIMIT = 30;
  const COMPLETE_PRODUCT_ID = "com.devildictionary.app.complete";

  const Native = (() => {
    const bridge = window.Capacitor;
    const isNative = !!(bridge && typeof bridge.isNativePlatform === "function" && bridge.isNativePlatform());
    return { isNative, plugin: name => (isNative ? bridge.registerPlugin(name) : null) };
  })();

  const HapticsPlugin = Native.plugin("Haptics");
  const StatusBarPlugin = Native.plugin("StatusBar");
  const SplashScreenPlugin = Native.plugin("SplashScreen");

  function haptic(style) {
    if (!HapticsPlugin) return;
    Promise.resolve(HapticsPlugin.impact({ style })).catch(() => {});
  }

  // Free pool: every tier-1 entry plus just enough tier-2 to taste the judgment.
  const FREE_ENTRIES = [...ENTRIES].sort((a, b) => a.tier - b.tier).slice(0, FREE_LIMIT);
  const els = Object.fromEntries([
    "board", "pathLayer", "selectionText", "targetWord", "folio", "hintButton", "shuffleButton",
    "coinCount", "completedCount", "totalCount", "progressFill", "coinPips", "coinRuleText",
    "stageName", "definitionModal", "definitionWord", "definitionPos", "definitionText",
    "definitionReveal", "judgmentPrompt", "definitionChoices", "judgmentFeedback", "readerNote",
    "newEntryBadge", "modalProgress", "nextButton", "coinCelebration", "coinMilestone", "stageCurtain",
    "curtainSigil", "curtainKicker", "curtainName", "curtainNote",
    "toast", "coinVault", "soundToggle", "resetButton", "gestureNote",
    "gameCard", "lockPanel", "lockHeadline", "lockUnlockButton", "lockRestoreButton",
    "paywallModal", "paywallLede", "paywallPrice", "buyButton", "restoreButton",
    "paywallStatus", "paywallDismiss"
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
      completed: [], order: [], current: null, hints: 0, rounds: 0, unlocked: false,
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
      parsed.unlocked = parsed.unlocked === true;
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

  const STAGE_SIZE = 25;

  const STAGE_CURTAINS = {
    2: {
      sigil: "II",
      kicker: "THE DICTIONARY NO LONGER TRUSTS YOU",
      name: "STAGE II · THE JUDGMENT",
      note: "Finding the word only proves you can read. Now prove you can doubt."
    },
    3: {
      sigil: "III",
      kicker: "THE DICTIONARY HAS STOPPED PRETENDING",
      name: "STAGE III · THE ACCOMPLICE",
      note: "You doubted every definition, and still you turned the page. That is consent."
    },
    4: {
      sigil: "IV",
      kicker: "THERE IS NO ONE LEFT TO BLAME",
      name: "STAGE IV · THE AUTHOR",
      note: "You have read the whole indictment. Now the dictionary hands you the pen."
    }
  };

  function getStage(count = save.completed.length) {
    if (count < STAGE_SIZE) return { tier: 1, name: "STAGE I · THE LITERATE", size: 5, title: "Find the word" };
    if (count < STAGE_SIZE * 2) return { tier: 2, name: "STAGE II · THE DOUBTER", size: 6, title: "Read between the letters" };
    if (count < STAGE_SIZE * 3) return { tier: 3, name: "STAGE III · THE ACCOMPLICE", size: 7, title: "The definition is watching" };
    return { tier: 4, name: "STAGE IV · THE AUTHOR", size: 8, title: "You are the dictionary now" };
  }

  function hasFullAccess() {
    return !Native.isNative || save.unlocked === true;
  }

  // True once a free player has read every entry they are allowed to read.
  function isLockedOut() {
    return !hasFullAccess() && save.completed.length >= FREE_LIMIT;
  }

  function pickEntry() {
    const stage = getStage();
    const pool = hasFullAccess() ? ENTRIES : FREE_ENTRIES;
    const eligible = pool.filter(entry => entry.tier <= stage.tier);
    let candidates = eligible.filter(entry => !save.completed.includes(entry.word));
    if (!candidates.length) candidates = pool.filter(entry => !save.completed.includes(entry.word));
    // Nothing left to discover: owners replay, free players hit the wall instead.
    if (!candidates.length) candidates = hasFullAccess() ? (eligible.length ? eligible : pool) : [];
    if (!candidates.length) return null;
    const recent = new Set(save.order.slice(-5));
    const fresh = candidates.filter(entry => !recent.has(entry.word));
    const final = fresh.length ? fresh : candidates;
    return final[Math.floor(Math.random() * final.length)];
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
    haptic("LIGHT");
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
    haptic("MEDIUM");
    if ((round.entry.tier === 2 || round.entry.tier === 4) && JUDGMENT_DECOYS[round.entry.word]) {
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
    const upcoming = getStage().tier > round.entry.tier ? STAGE_CURTAINS[getStage().tier] : null;
    els.nextButton.textContent = upcoming
      ? `ENTER ${upcoming.name}`
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
      haptic("LIGHT");
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
    haptic("MEDIUM");
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
    const enteredTier = getStage().tier;
    const curtain = round.entry.tier < enteredTier ? STAGE_CURTAINS[enteredTier] : null;
    els.definitionModal.classList.remove("open");
    els.definitionModal.classList.remove("judging");
    els.definitionModal.setAttribute("aria-hidden", "true");
    const next = pickEntry();
    if (isLockedOut() || !next) {
      openPaywall();
      return;
    }
    if (curtain) {
      els.curtainSigil.textContent = curtain.sigil;
      els.curtainKicker.textContent = curtain.kicker;
      els.curtainName.textContent = curtain.name;
      els.curtainNote.textContent = curtain.note;
      sound.stage();
      haptic("HEAVY");
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
    haptic("HEAVY");
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

  /* ---------------- Complete edition: StoreKit bridge ---------------- */

  let purchasePlugin;
  let purchasePluginTried = false;

  // The plugin ships as a UMD bundle (dist/purchase.js) that hangs itself off the
  // `capacitorExports` global Capacitor injects. Loading it lazily keeps the web
  // build untouched and avoids a bundler for a single plugin.
  async function ensurePurchases() {
    if (!Native.isNative) return null;
    if (purchasePlugin || purchasePluginTried) return purchasePlugin;
    purchasePluginTried = true;
    if (!window.capacitorNativePurchases) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "./purchase.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("purchase.js failed to load"));
        document.head.appendChild(script);
      });
    }
    purchasePlugin = window.capacitorNativePurchases?.NativePurchases || null;
    return purchasePlugin;
  }

  async function hasEntitlement() {
    const plugin = await ensurePurchases().catch(() => null);
    if (!plugin) return false;
    try {
      const { purchases } = await plugin.getPurchases({ productType: "inapp", onlyCurrentEntitlements: true });
      return (purchases || []).some(item => item.productIdentifier === COMPLETE_PRODUCT_ID);
    } catch {
      return false;
    }
  }

  async function loadProductPrice() {
    const plugin = await ensurePurchases().catch(() => null);
    if (!plugin) return null;
    try {
      const { products } = await plugin.getProducts({
        productIdentifiers: [COMPLETE_PRODUCT_ID],
        productType: "inapp"
      });
      // App Review: always show the store's own title and price, never a hardcoded one.
      return products?.[0] || null;
    } catch {
      return null;
    }
  }

  function setPaywallBusy(busy) {
    els.buyButton.disabled = busy;
    els.restoreButton.disabled = busy;
  }

  function setPaywallStatus(message) {
    els.paywallStatus.textContent = message;
    els.paywallStatus.hidden = !message;
  }

  async function openPaywall() {
    const read = save.completed.length;
    els.paywallLede.textContent = `You have read ${read} of ${ENTRIES.length} entries. The other ${ENTRIES.length - read} are still in the vault.`;
    setPaywallStatus("");
    els.paywallModal.classList.add("open");
    els.paywallModal.setAttribute("aria-hidden", "false");
    if (!Native.isNative) return;
    setPaywallBusy(true);
    const product = await loadProductPrice();
    setPaywallBusy(false);
    els.paywallPrice.textContent = product?.priceString || "unavailable";
  }

  function closePaywall() {
    els.paywallModal.classList.remove("open");
    els.paywallModal.setAttribute("aria-hidden", "true");
    setPaywallBusy(false);
  }

  function showLockPanel() {
    els.lockHeadline.textContent = `You have read ${save.completed.length} of ${ENTRIES.length}.`;
    els.lockPanel.hidden = false;
    els.gameCard.classList.add("locked");
  }

  function hideLockPanel() {
    els.lockPanel.hidden = true;
    els.gameCard.classList.remove("locked");
  }

  async function grantUnlock(message) {
    save.unlocked = true;
    persist();
    haptic("HEAVY");
    closePaywall();
    hideLockPanel();
    updateHUD();
    showToast(message);
    const next = pickEntry();
    if (next) makeBoard(next);
  }

  async function buyCompleteEdition() {
    const plugin = await ensurePurchases().catch(() => null);
    if (!plugin) return setPaywallStatus("Purchases are unavailable right now. Check your connection and try again.");
    setPaywallBusy(true);
    setPaywallStatus("Contacting the App Store…");
    try {
      const transaction = await plugin.purchaseProduct({
        productIdentifier: COMPLETE_PRODUCT_ID,
        productType: "inapp"
      });
      if (transaction?.productIdentifier === COMPLETE_PRODUCT_ID) {
        await grantUnlock("Paid in full. The vault is open.");
      } else {
        setPaywallStatus("The purchase did not finish. Nothing has been charged.");
      }
    } catch (error) {
      const cancelled = /cancel/i.test(String(error?.message || error?.code || ""));
      setPaywallStatus(cancelled
        ? "Purchase cancelled. The dictionary will wait."
        : "The purchase could not be completed. Please try again.");
    } finally {
      setPaywallBusy(false);
    }
  }

  async function restoreCompleteEdition() {
    const plugin = await ensurePurchases().catch(() => null);
    if (!plugin) return setPaywallStatus("Purchases are unavailable right now.");
    setPaywallBusy(true);
    setPaywallStatus("Looking for your purchase…");
    try {
      await plugin.restorePurchases();
      if (await hasEntitlement()) {
        await grantUnlock("Restored. The vault is open again.");
      } else {
        setPaywallStatus("No earlier purchase was found for this Apple ID.");
      }
    } catch {
      setPaywallStatus("Restore failed. Please try again.");
    } finally {
      setPaywallBusy(false);
    }
  }

  // A reinstall or a new device must not lose a purchase the user already paid for.
  async function syncEntitlementOnLaunch() {
    if (!Native.isNative || save.unlocked) return;
    if (await hasEntitlement()) {
      save.unlocked = true;
      persist();
      updateHUD();
    }
  }

  async function configureNativeChrome() {
    if (!Native.isNative) return;
    try { await StatusBarPlugin.setStyle({ style: "DARK" }); } catch { /* older iOS */ }
    try { await StatusBarPlugin.setBackgroundColor({ color: "#17120e" }); } catch { /* no-op */ }
    try { await SplashScreenPlugin.hide(); } catch { /* already hidden */ }
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
    // Resetting progress must never revoke something the player already paid for.
    const purchased = save.unlocked === true;
    localStorage.removeItem(STORAGE_KEY);
    save = loadSave();
    save.unlocked = purchased;
    persist();
    els.resetButton.dataset.confirm = "";
    els.resetButton.textContent = "RESET MY PROGRESS";
    hideLockPanel();
    makeBoard(pickEntry());
    showToast("A new dictionary has been opened.");
  }

  function init() {
    els.totalCount.textContent = ENTRIES.length;
    updateHUD();
    const current = ENTRIES.find(entry => entry.word === save.current && !save.completed.includes(entry.word));
    const first = current && !isLockedOut() ? current : pickEntry();
    if (isLockedOut() || !first) {
      showLockPanel();
    } else {
      makeBoard(first);
    }
    els.buyButton.addEventListener("click", buyCompleteEdition);
    els.restoreButton.addEventListener("click", restoreCompleteEdition);
    els.paywallDismiss.addEventListener("click", () => { closePaywall(); showLockPanel(); });
    els.lockUnlockButton.addEventListener("click", openPaywall);
    els.lockRestoreButton.addEventListener("click", restoreCompleteEdition);
    els.hintButton.addEventListener("click", showHint);
    els.shuffleButton.addEventListener("click", () => { sound.shuffle(); makeBoard(round.entry, true); showToast("Same word. The lies have been rearranged."); });
    els.nextButton.addEventListener("click", nextRound);
    els.coinVault.addEventListener("click", () => { sound.coinTap(); showToast("Every 5 different entries completed resets the count and mints one more coin."); });
    els.soundToggle.addEventListener("click", toggleSound);
    els.resetButton.addEventListener("click", resetProgress);
    window.addEventListener("resize", () => requestAnimationFrame(() => drawPath(selection, false)));
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (els.paywallModal.classList.contains("open")) {
        closePaywall();
        showLockPanel();
      } else if (els.definitionModal.classList.contains("open") && !els.nextButton.hidden) {
        nextRound();
      }
    });
    window.__DEVILS_GAME__ = {
      entries: ENTRIES,
      freeEntries: FREE_ENTRIES,
      isNative: Native.isNative,
      hasFullAccess,
      getState: () => ({ ...save, coins: Math.floor(save.completed.length / 5), round: round ? { ...round } : null }),
      solveCurrent: () => { selection = [...round.path]; paintSelection(); finishSelection(); },
      openPaywall,
      grantUnlock,
      reset: () => { localStorage.removeItem(STORAGE_KEY); location.reload(); }
    };
    configureNativeChrome();
    syncEntitlementOnLaunch();
  }

  init();
})();
