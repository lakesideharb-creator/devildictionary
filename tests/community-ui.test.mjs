import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Window } from "happy-dom";
const html = fs.readFileSync("community.html", "utf8");
const script = fs.readFileSync("community.js", "utf8");
const entry = {
  id: "test-entry",
  word: "POWER",
  pos: "noun",
  definition: "The privilege of calling your preferences principles.",
  author: "Preview example",
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));
async function boot(entries = [entry]) {
  const window = new Window({ url: "http://localhost/community.html" });
  window.document.write(
    html.replace(/<script type="module" src="\/community.js"><\/script>/, ""),
  );
  window.Math.random = () => 0;
  window.fetch = async () => ({
    ok: true,
    json: async () => ({ entries, hasMore: false }),
  });
  window.eval(script);
  await flush();
  return window;
}
test("community game reveals the credited definition only after selecting the word", async () => {
  const w = await boot();
  w.document.querySelector(".entry button").click();
  assert.equal(w.document.querySelector("#reveal").hidden, true);
  const cells = w.document.querySelectorAll("#community-board button");
  cells[0].click();
  cells[4].click();
  assert.equal(w.document.querySelector("#reveal").hidden, false);
  assert.match(
    w.document.querySelector("#byline").textContent,
    /Preview example/,
  );
  assert.match(
    w.document.querySelector("#definition").textContent,
    /privilege/,
  );
  assert.equal(w.localStorage.length, 0);
  await w.happyDOM.close();
});
test("untrusted definitions and author names remain plain text", async () => {
  const w = await boot([
    {
      ...entry,
      author: "<img src=x onerror=alert(1)>",
      definition: "<script>alert(1)</script>",
    },
  ]);
  assert.equal(w.document.querySelector("#collection img"), null);
  w.document.querySelector(".entry button").click();
  const cells = w.document.querySelectorAll("#community-board button");
  cells[0].click();
  cells[4].click();
  assert.equal(w.document.querySelector("#reveal script"), null);
  assert.match(w.document.querySelector("#definition").textContent, /<script>/);
  await w.happyDOM.close();
});
test("failed submissions preserve the draft and restore the submit button", async () => {
  const w = await boot([]);
  w.fetch = async () => ({
    ok: false,
    json: async () => ({ error: "Service unavailable" }),
  });
  w.document.querySelector("#word").value = "HOPE";
  w.document.querySelector("#entry-definition").value =
    "A future with the receipts removed.";
  w.document.querySelector("input[type=checkbox]").checked = true;
  w.document
    .querySelector("form")
    .dispatchEvent(new w.Event("submit", { cancelable: true }));
  await flush();
  assert.equal(w.document.querySelector("#word").value, "HOPE");
  assert.equal(w.document.querySelector("form button").disabled, false);
  assert.equal(
    w.document.querySelector("#submission-status").textContent,
    "Service unavailable",
  );
  await w.happyDOM.close();
});
