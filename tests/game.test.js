const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

test("page contains all playable surfaces", () => {
  for (const id of ["board", "pathLayer", "hintButton", "soundToggle", "definitionModal", "definitionChoices", "judgmentFeedback", "stageCurtain", "coinCount", "coinCelebration", "progressFill"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /<script src="\.\/app\.js"><\/script>/);
});

test("dictionary has 100 unique playable entries across four stages", () => {
  const words = [...js.matchAll(/\{ word: "([A-Z]+)"[^\n]+tier: ([1-4]) \}/g)];
  assert.equal(words.length, 100);
  assert.equal(new Set(words.map(match => match[1])).size, 100);
  assert.deepEqual(new Set(words.map(match => match[2])), new Set(["1", "2", "3", "4"]));
  for (const tier of ["1", "2", "3", "4"]) {
    assert.equal(words.filter(match => match[2] === tier).length, 25, `stage ${tier} has 25 entries`);
  }
});

test("every judged entry has two contrasting decoys", () => {
  const decoyWords = [...js.matchAll(/^    ([A-Z]+): \[$/gm)].map(match => match[1]);
  const judged = [...js.matchAll(/\{ word: "([A-Z]+)"[^\n]+tier: ([24]) \}/g)].map(match => match[1]);
  assert.equal(decoyWords.length, 50, "half the dictionary is judged");
  assert.deepEqual(new Set(decoyWords), new Set(judged), "decoys exist for exactly the judged words");
  assert.equal((js.match(/bias: "COMFORT"/g) || []).length, decoyWords.length);
  assert.equal((js.match(/bias: "ORDER"/g) || []).length, decoyWords.length);
});

test("coin balance is derived from unique completed count", () => {
  assert.match(js, /Math\.floor\(save\.completed\.length \/ 5\)/);
  assert.match(js, /\[\.\.\.new Set\(/);
  assert.equal(Math.floor(24 / 5), 4);
  assert.equal(Math.floor(25 / 5), 5);
});

test("hint and reward animations are present", () => {
  assert.match(css, /@keyframes dash-march/);
  assert.match(css, /@keyframes coin-spin/);
  assert.match(css, /@keyframes reward-pop/);
  assert.match(js, /drawPath\(round\.path, true\)/);
});

test("stage judgment is wired into the reveal flow", () => {
  assert.match(js, /function judgeDefinition/);
  assert.match(css, /@keyframes curtain-reveal/);
  assert.match(css, /@keyframes definition-strike/);
});

test("the game itself is free: no paywall and no in-app purchase", () => {
  // No gating code of any kind: no free tier limit, no product id, no StoreKit calls.
  for (const token of ["FREE_LIMIT", "COMPLETE_PRODUCT_ID", "purchaseProduct", "restorePurchases", "getProducts", "hasFullAccess", "openPaywall", "save.unlocked"]) {
    assert.doesNotMatch(js, new RegExp(token.replace(".", "\\.")), `${token} must not exist`);
  }
  // Strip meta and JSON-LD first: marketing copy saying "no paywall" must stay
  // allowed, we only care about real gating markup.
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<meta\b[^>]*>/g, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
  for (const token of ["paywall", "lockPanel", "RESTORE MY PURCHASE", "restorePurchases"]) {
    assert.doesNotMatch(markup, new RegExp(token, "i"), `${token} must not appear in index.html`);
  }
  assert.doesNotMatch(css, /paywall|lock-panel/);
  // The shop may sell paper goods, but nothing may sell access to the game.
  assert.doesNotMatch(markup, /unlock (the )?(full|complete|rest)|full (version|access) (for|at) \$/i);
});

test("legal pages sell paper and PDFs, never access to the game", () => {
  // Prices are allowed now that printable packs exist, but every price must sit
  // next to a physical or downloadable product - never next to game content.
  const GOODS = /printable|cards?|edition|bundle|paperback|kindle|pdf|a4|letter|shipping|pack/i;
  for (const file of ["pricing.html", "refund.html", "terms.html", "privacy.html"]) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(text, /Restore Purchases/i, `${file} still promises a restore`);
    for (const m of text.matchAll(/\$\d+(?:\.\d\d)?/g)) {
      const window = text.slice(Math.max(0, m.index - 240), m.index + 240);
      assert.match(window, GOODS, `${file} quotes ${m[0]} without naming a product`);
    }
  }
});

test("mechanical sound system is synthesized without external audio files", () => {
  assert.match(js, /function createSoundEngine/);
  assert.match(js, /window\.AudioContext \|\| window\.webkitAudioContext/);
  assert.match(js, /createOscillator/);
  assert.match(js, /createBufferSource/);
  assert.doesNotMatch(html, /<audio|\.mp3|\.wav|\.ogg/i);
  assert.match(css, /@keyframes sound-wave/);
});
