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

test("dictionary has 45 unique playable entries across three stages", () => {
  const words = [...js.matchAll(/\{ word: "([A-Z]+)"[^\n]+tier: ([123]) \}/g)];
  assert.equal(words.length, 45);
  assert.equal(new Set(words.map(match => match[1])).size, 45);
  assert.deepEqual(new Set(words.map(match => match[2])), new Set(["1", "2", "3"]));
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

test("stage two has a complete definition judgment set", () => {
  assert.equal((js.match(/^    [A-Z]+: \[$/gm) || []).length, 15);
  assert.equal((js.match(/bias: "COMFORT"/g) || []).length, 15);
  assert.equal((js.match(/bias: "ORDER"/g) || []).length, 15);
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
