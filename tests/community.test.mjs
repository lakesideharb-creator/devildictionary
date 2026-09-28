import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { scryptSync } from "node:crypto";
process.env.COMMUNITY_LOCAL = "1";
process.env.COMMUNITY_DB = ":memory:";
process.env.COMMUNITY_SESSION_SECRET =
  "test-secret-with-more-than-32-characters";
process.env.COMMUNITY_ADMIN_HASH =
  "test-salt:" +
  scryptSync("correct-test-password", "test-salt", 64).toString("hex");
const { handle } = await import("../server/community.mjs");
const server = http.createServer(handle);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
process.env.COMMUNITY_ORIGIN = origin;
let cookie = "";
async function call(action, body, options = {}) {
  const response = await fetch(origin + "/api/community?action=" + action, {
    method: body ? "POST" : "GET",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      Cookie: options.guest ? "" : cookie,
      ...options.headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie"),
  };
}
const entry = {
  word: "POWER",
  pos: "noun",
  definition: "The privilege of calling your preferences principles.",
  author: "A Reader",
  consent: true,
};
test("submission, private review, publication, report, removal and access boundaries", async () => {
  assert.equal((await call("desk")).status, 401);
  assert.equal(
    (await call("submit", { ...entry, consent: false })).status,
    400,
  );
  assert.equal(
    (
      await call("submit", entry, {
        headers: { Origin: "https://attacker.example" },
      })
    ).status,
    403,
  );
  const submitted = await call("submit", entry);
  assert.equal(submitted.status, 201);
  const id = submitted.data.id;
  assert.deepEqual((await call("entries")).data.entries, []);
  assert.equal((await call("entries&id=" + id)).status, 404);
  assert.equal(
    (await call("moderate", { id, status: "approved" })).status,
    401,
  );
  assert.equal((await call("login", { password: "wrong" })).status, 401);
  const login = await call("login", { password: "correct-test-password" });
  assert.equal(login.status, 200);
  assert.match(login.cookie, /HttpOnly/);
  cookie = login.cookie.split(";")[0];
  assert.equal((await call("desk")).data.entries[0].id, id);
  assert.equal(
    (await call("moderate", { id, status: "approved" })).status,
    200,
  );
  const published = (await call("entries&id=" + id)).data.entries[0];
  assert.equal(published.author, "A Reader");
  assert.equal(published.status, undefined);
  assert.equal(published.consent, undefined);
  assert.equal(
    (
      await call(
        "report",
        { id, reason: "Please review this test entry." },
        { guest: true },
      )
    ).status,
    201,
  );
  const report = (await call("desk")).data.reports[0];
  assert.equal(report.entry_id, id);
  assert.equal((await call("resolve", { id: report.id })).status, 200);
  assert.equal((await call("desk")).data.reports.length, 0);
  assert.equal((await call("moderate", { id, status: "removed" })).status, 200);
  assert.equal((await call("entries&id=" + id)).status, 404);
  assert.equal(
    (await call("moderate", { id, status: "approved" })).status,
    409,
  );
  assert.equal((await call("logout", {})).status, 200);
  cookie = "";
  assert.equal((await call("desk")).status, 401);
});
test("rate limiting is server-enforced, not a browser flag", async () => {
  let limited = false;
  for (let i = 0; i < 7; i++) {
    const result = await call("submit", entry);
    if (result.status === 429) limited = true;
  }
  assert.equal(limited, true);
});
test.after(() => server.close());
