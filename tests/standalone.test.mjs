import { Window } from "happy-dom";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = fs.readFileSync(path.join(root, "The-Devils-Dictionary.html"), "utf8");
assert.doesNotMatch(standalone, /<script[^>]+src=/i);
assert.doesNotMatch(standalone, /<link[^>]+stylesheet/i);
assert.match(standalone, /@keyframes coin-spin/);
assert.match(standalone, /const JUDGMENT_DECOYS/);

const scripts = [...standalone.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
const window = new Window({ url: "file:///The-Devils-Dictionary.html" });
window.document.write(standalone.replace(/<script>[\s\S]*?<\/script>/, ""));
window.document.close();
window.Element.prototype.setPointerCapture = () => {};
window.Element.prototype.animate = () => ({ finished: Promise.resolve() });
window.eval(scripts[0][1]);

assert.equal(window.document.querySelectorAll(".letter").length, 25);
assert.equal(window.__DEVILS_GAME__.entries.length, 45);
window.document.getElementById("hintButton").click();
assert.ok(window.document.querySelector(".path-line.hint"));
window.__DEVILS_GAME__.solveCurrent();
await new Promise(resolve => setTimeout(resolve, 270));
assert.ok(window.document.getElementById("definitionModal").classList.contains("open"));
assert.equal(window.document.getElementById("completedCount").textContent, "1");
window.close();
console.log("Standalone HTML OK: offline load, grid, hint, solve, definition and progress");
