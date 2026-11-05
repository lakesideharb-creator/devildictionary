import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the iOS bundle holds the game and nothing from the website", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "ios-bundle-"));
  try {
    execFileSync(process.execPath, [path.join(root, "scripts/build-ios.mjs"), out]);
    const html = fs.readFileSync(path.join(out, "index.html"), "utf8");

    const refs = [...html.matchAll(/<(?:script|link rel="stylesheet")[^>]*(?:src|href)="\.?\/([^"]+)"/g)].map(match => match[1]);
    assert.ok(refs.includes("app.js") && refs.includes("styles.css"), "the page still loads the game");
    for (const ref of refs) assert.ok(fs.existsSync(path.join(out, ref)), `${ref} is bundled`);

    for (const name of ["print-play.html", "pricing.html", "community.html", "shop.js", "analytics.js", "word", "og", "downloads", "promo"]) {
      assert.equal(fs.existsSync(path.join(out, name)), false, `${name} stays on the website`);
    }
    assert.doesNotMatch(html, /house-rail/, "house ads are stripped");
    for (const name of fs.readdirSync(out).filter(file => /\.(js|html)$/.test(file))) {
      assert.doesNotMatch(fs.readFileSync(path.join(out, name), "utf8"), /creem\.io|posthog\.com|fbevents/, `${name} has no checkout or tracking`);
    }
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});
