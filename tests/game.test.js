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

test("mechanical sound system is synthesized without external audio files", () => {
  assert.match(js, /function createSoundEngine/);
  assert.match(js, /window\.AudioContext \|\| window\.webkitAudioContext/);
  assert.match(js, /createOscillator/);
  assert.match(js, /createBufferSource/);
  assert.doesNotMatch(html, /<audio|\.mp3|\.wav|\.ogg/i);
  assert.match(css, /@keyframes sound-wave/);
});
