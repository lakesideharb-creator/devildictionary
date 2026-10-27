import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Window } from "happy-dom";

const source = fs.readFileSync(new URL("../analytics.js", import.meta.url), "utf8");
const PIXEL_ID = "1832150057779347";
const POSTHOG_KEY = "phc_yEVJFtudPsoM57mHjf9MgFontV6iZNptaDjCUBDD5Puh";
const POSTHOG_HOST = "https://us.i.posthog.com";
const ARRAY_SRC = "https://us-assets.i.posthog.com/static/array.js";

function boot(url, setup) {
  const window = new Window({
    url,
    settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true }
  });
  // The PostHog snippet inserts array.js before the first script tag.
  window.document.head.appendChild(window.document.createElement("script"));
  setup?.(window);
  window.eval(source);
  return window;
}

function calls(window) {
  return window.fbq.queue.map(entry => Array.from(entry));
}

function pixelScript(window) {
  return [...window.document.scripts].find(script => String(script.src).includes("fbevents.js"));
}

function captures(window) {
  // The stub's arrays are created in the page realm, so copy them into plain JSON.
  return JSON.parse(JSON.stringify(
    [...window.posthog].filter(entry => Array.isArray(entry) && entry[0] === "capture")
  ));
}

function posthogConfig(window) {
  const queued = window.posthog._i[0];
  assert.equal(queued[0], POSTHOG_KEY);
  return queued[1];
}

function arrayScript(window) {
  return [...window.document.scripts].find(script => String(script.src).includes("array.js"));
}

test("the public site loads the Meta Pixel and PostHog US Cloud", () => {
  const window = boot("https://devildictionary.com/");
  const pixel = pixelScript(window);
  assert.equal(pixel.async, true);
  assert.equal(pixel.src, "https://connect.facebook.net/en_US/fbevents.js");
  const queued = calls(window);
  assert.deepEqual(queued[0], ["init", PIXEL_ID]);
  assert.deepEqual(queued[1], ["track", "PageView"]);
  assert.equal(queued.some(entry => entry.includes("Purchase")), false);

  const config = posthogConfig(window);
  assert.equal(config.api_host, POSTHOG_HOST);
  assert.equal(config.ui_host, "https://us.posthog.com");
  assert.equal(config.capture_pageview, true);
  assert.notEqual(config.capture_pageview, "history_change");
  assert.equal(config.autocapture, false);
  assert.equal(config.disable_session_recording, true);
  assert.equal(config.person_profiles, "identified_only");
  const posthog = arrayScript(window);
  assert.equal(posthog.async, true);
  assert.equal(posthog.src, ARRAY_SRC);
  const vercel = [...window.document.scripts].find(script => String(script.src).includes("/_vercel/insights/script.js"));
  assert.equal(vercel.defer, true);
  assert.equal(captures(window).some(entry => entry[1] === "$pageview" || entry[1] === "PageView"), false);
  assert.doesNotMatch(source, /posthog\.capture\(\s*["']\$pageview["']/);
  const hosts = source.match(/https:\/\/[a-z0-9.-]*posthog\.com/g) || [];
  assert.ok(hosts.length > 0);
  assert.ok(hosts.every(host => host.startsWith("https://us")), hosts.join(", "));
  assert.ok(hosts.includes(POSTHOG_HOST));
  window.happyDOM.close();
});

test("the Capacitor app and file copies install neither Meta nor PostHog", () => {
  const native = boot("https://devildictionary.com/", window => {
    window.Capacitor = { isNativePlatform: () => true };
  });
  assert.equal(native.fbq, undefined);
  assert.equal(pixelScript(native), undefined);
  assert.equal(native.posthog, undefined);
  assert.equal(arrayScript(native), undefined);
  native.ddTrack("Game start");
  native.happyDOM.close();

  const offline = boot("file:///The-Devils-Dictionary.html");
  assert.equal(offline.fbq, undefined);
  assert.equal(pixelScript(offline), undefined);
  assert.equal(offline.posthog, undefined);
  assert.equal(arrayScript(offline), undefined);
  offline.happyDOM.close();
});

test("game events map to StartPlay and CompleteWord on both Meta and PostHog", () => {
  const window = boot("https://devildictionary.com/");
  window.ddTrack("Game start");
  window.ddTrack("Word complete", {
    word: "HOPE",
    tier: 1,
    fresh: true,
    email: "person@example.com",
    address: "1 Dictionary Lane",
    en: "A definition that must stay off the wire.",
    definition: "Also stripped."
  });
  window.ddTrack("Purchase CTA", { place: "checkout" });

  const custom = calls(window).filter(entry => entry[0] === "trackCustom");
  assert.deepEqual(custom[0], ["trackCustom", "StartPlay"]);
  assert.equal(custom[1][1], "CompleteWord");
  assert.equal(custom[1][2].word, "HOPE");
  assert.equal(custom[1][2].tier, 1);
  assert.equal(custom[1][2].fresh, "true");
  assert.equal(custom[1][2].email, undefined);
  assert.equal(custom[1][2].en, undefined);
  assert.equal(calls(window).some(entry => entry[1] === "Purchase"), false);

  const queued = captures(window);
  assert.deepEqual(queued[0], ["capture", "StartPlay"]);
  assert.equal(queued[1][1], "CompleteWord");
  assert.deepEqual(queued[1][2], { word: "HOPE", tier: 1, fresh: true });
  assert.deepEqual(queued[2], ["capture", "Purchase CTA", { place: "checkout" }]);
  assert.equal(JSON.stringify(queued).includes("person@example.com"), false);
  assert.equal(JSON.stringify(queued).includes("Dictionary Lane"), false);
  const vercel = [...window.vaq].map(entry => Array.from(entry));
  assert.equal(vercel[0][1].name, "Game start");
  assert.equal(vercel[1][1].name, "Word complete");
  assert.equal(vercel[1][1].data.email, undefined);
  window.happyDOM.close();
});

test("a buy link is not a Meta Purchase and stays a PostHog Purchase CTA", () => {
  const window = boot("https://devildictionary.com/");
  window.document.body.innerHTML = `<a class="shop-buy" href="https://www.creem.io/payment/prod_example">Buy</a>`;
  window.document.querySelector("a").dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(calls(window).some(entry => entry[1] === "Purchase"), false);
  const queued = captures(window);
  assert.equal(queued.length, 1);
  assert.deepEqual(queued[0], ["capture", "Purchase CTA", { place: "checkout", product: "prod_example", page: "/" }]);
  window.happyDOM.close();
});

test("checkout clicks name the product and price, and shop opens keep their place", () => {
  const window = boot("https://devildictionary.com/print-play");
  window.document.body.innerHTML = `
    <div class="shop-banner"><a href="/print-play" data-shop-open>Get Printable Cards</a></div>
    <div class="shop-mobile"><a href="/print-play" data-shop-open>Get Printable Cards</a></div>
    <a class="shop-buy" href="https://www.creem.io/payment/prod_XEhxj6wfeIfoNzHcvuVxR">Adult</a>
    <a href="https://www.creem.io/payment/prod_5x9nABognL3Zp8viH8hiCS">Family</a>
    <a class="shop-buy" href="https://www.creem.io/payment/prod_GdeLw30T7sPq6MO1UQdsG">Bundle</a>`;
  for (const link of window.document.querySelectorAll("a")) {
    link.addEventListener("click", event => event.preventDefault());
    link.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  }
  assert.deepEqual(captures(window), [
    ["capture", "Purchase CTA", { place: "banner" }],
    ["capture", "Purchase CTA", { place: "mobile" }],
    ["capture", "Purchase CTA", { place: "checkout", product: "adult", price: 2.99, page: "/print-play" }],
    ["capture", "Purchase CTA", { place: "checkout", product: "family", price: 2.99, page: "/print-play" }],
    ["capture", "Purchase CTA", { place: "checkout", product: "bundle", price: 4.99, page: "/print-play" }]
  ]);
  assert.equal(calls(window).some(entry => entry[1] === "Purchase"), false);
  window.happyDOM.close();
});

test("a shop nudge click is its own event and still counts as a purchase or house ad", () => {
  const window = boot("https://devildictionary.com/");
  window.document.body.innerHTML = `
    <aside class="shop-nudge">
      <a class="shop-nudge-print" href="/print-play" data-shop-open data-shop-nudge="verdict" data-shop-nudge-target="print-play">Shop Print & Play</a>
      <a class="shop-nudge-book" href="https://www.amazon.com/dp/B0HLN1S6V6" data-house-ad data-house-placement="nudge" data-house-target="B0HLN1S6V6" data-shop-nudge="complete" data-shop-nudge-target="B0HLN1S6V6">The paperback</a>
    </aside>`;
  for (const link of window.document.querySelectorAll("a")) {
    link.addEventListener("click", event => event.preventDefault());
    link.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  }
  assert.equal(calls(window).some(entry => entry[1] === "Purchase"), false);
  assert.equal(calls(window).some(entry => entry[1] === "shop_nudge_click" || entry[1] === "shop_nudge_shown"), false);
  assert.equal(calls(window).some(entry => entry[1] === "house_ad_click"), true);
  assert.deepEqual(captures(window), [
    ["capture", "shop_nudge_click", { moment: "verdict", target: "print-play" }],
    ["capture", "Purchase CTA", { place: "nudge" }],
    ["capture", "shop_nudge_click", { moment: "complete", target: "B0HLN1S6V6" }],
    ["capture", "house_ad_click", { placement: "nudge", target: "B0HLN1S6V6" }]
  ]);
  window.ddTrack("shop_nudge_shown", { moment: "stage", stage: 2 });
  assert.deepEqual(captures(window).at(-1), ["capture", "shop_nudge_shown", { moment: "stage", stage: 2 }]);
  const vercel = [...window.vaq].map(entry => Array.from(entry));
  assert.equal(vercel.at(-1)[1].name, "shop_nudge_shown");
  assert.equal(vercel.at(-1)[1].data.stage, 2);
  window.happyDOM.close();
});

test("a stage unlock reaches Vercel and PostHog as Stage reached", () => {
  const window = boot("https://devildictionary.com/");
  window.ddTrack("Stage reached", { stage: 2, completed: 25 });
  assert.deepEqual(captures(window).at(-1), ["capture", "Stage reached", { stage: 2, completed: 25 }]);
  const vercel = [...window.vaq].map(entry => Array.from(entry));
  assert.equal(vercel.at(-1)[1].name, "Stage reached");
  assert.equal(vercel.at(-1)[1].data.stage, 2);
  window.happyDOM.close();
});

test("an accepted signup fires Meta Lead and PostHog subscribe_success, without the address", async () => {
  const window = boot("https://devildictionary.com/");
  window.document.body.innerHTML = `<form data-subscribe action="/api/subscribe">
    <input name="email" value="person@example.com" />
    <button type="submit">Send me the letter</button>
    <p data-subscribe-status></p>
  </form>`;
  const form = window.document.querySelector("form");
  window.fetch = async () => ({
    ok: true,
    json: async () => ({ ok: true, status: "subscribed", message: "You’re on the list." })
  });
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 20));

  const lead = calls(window).find(entry => entry[1] === "Lead");
  assert.equal(lead[0], "track");
  assert.equal(lead[1], "Lead");
  assert.equal(lead[2].content_name, "daily letter");
  assert.deepEqual(Object.keys(lead[2]), ["content_name"]);
  assert.equal(JSON.stringify(calls(window)).includes("person@example.com"), false);

  const queued = captures(window);
  assert.equal(queued.length, 1);
  assert.deepEqual(queued[0], ["capture", "subscribe_success", { content_name: "daily letter" }]);
  assert.equal(JSON.stringify(queued).includes("person@example.com"), false);
  assert.equal(JSON.stringify([...window.posthog]).includes("identify"), false);
  assert.equal(form.dataset.state, "success");
  const vercel = [...window.vaq].map(entry => Array.from(entry));
  assert.equal(vercel.at(-1)[1].name, "Subscribe");
  assert.equal(vercel.at(-1)[1].data.result, "subscribed");
  assert.equal(vercel.at(-1)[1].data.email, undefined);
  window.happyDOM.close();
});

test("a refused or unreachable signup fires neither Lead nor subscribe_success", async () => {
  const refused = boot("https://devildictionary.com/");
  refused.document.body.innerHTML = `<form data-subscribe action="/api/subscribe">
    <input name="email" value="person@example.com" />
    <button type="submit">Send me the letter</button>
    <p data-subscribe-status></p>
  </form>`;
  refused.fetch = async () => ({
    ok: false,
    json: async () => ({ ok: false, status: "error", message: "The list could not be reached." })
  });
  refused.document.querySelector("form").dispatchEvent(new refused.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(calls(refused).some(entry => entry[1] === "Lead"), false);
  const refusedCaptures = captures(refused);
  assert.equal(refusedCaptures.some(entry => entry[1] === "subscribe_success" || entry[1] === "Subscribe"), false);
  assert.equal(JSON.stringify(refusedCaptures).includes("person@example.com"), false);
  assert.equal(refused.document.querySelector("form").dataset.state, "refused");
  const refusedVercel = [...refused.vaq].map(entry => Array.from(entry));
  assert.equal(refusedVercel.at(-1)[1].name, "Subscribe");
  assert.equal(refusedVercel.at(-1)[1].data.result, "error");
  refused.happyDOM.close();

  const offline = boot("https://devildictionary.com/");
  offline.document.body.innerHTML = `<form data-subscribe action="/api/subscribe">
    <input name="email" value="person@example.com" />
    <button type="submit">Send me the letter</button>
    <p data-subscribe-status></p>
  </form>`;
  offline.fetch = async () => { throw new Error("network down"); };
  offline.document.querySelector("form").dispatchEvent(new offline.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(calls(offline).some(entry => entry[1] === "Lead"), false);
  const offlineCaptures = captures(offline);
  assert.equal(offlineCaptures.some(entry => entry[1] === "subscribe_success" || entry[1] === "Subscribe"), false);
  assert.equal(offline.document.querySelector("form").dataset.state, "refused");
  offline.happyDOM.close();
});

test("before_send strips email, address, and definition text", () => {
  const window = boot("https://devildictionary.com/");
  const event = posthogConfig(window).before_send({
    event: "CompleteWord",
    properties: {
      word: "HOPE",
      email: "person@example.com",
      address: "1 Dictionary Lane",
      definition: "A secret.",
      en: "Also a secret.",
      note: "Write to person@example.com please."
    },
    $set: { email: "person@example.com", plan: "reader" }
  });
  assert.equal(event.properties.word, "HOPE");
  assert.equal(event.properties.email, undefined);
  assert.equal(event.properties.address, undefined);
  assert.equal(event.properties.definition, undefined);
  assert.equal(event.properties.en, undefined);
  assert.equal(event.properties.note, "Write to [redacted] please.");
  assert.equal(event.$set.email, undefined);
  assert.equal(event.$set.plan, "reader");
  window.happyDOM.close();
});

test("a house ad click is a light custom event and does not throw without the SDKs", () => {
  const window = boot("https://devildictionary.com/");
  window.document.body.innerHTML = `<a data-house-ad data-house-placement="left" data-house-target="B0HLN1S6V6" href="https://www.amazon.com/dp/B0HLN1S6V6">View on Amazon</a>`;
  window.document.querySelector("a").dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  const custom = calls(window).filter(entry => entry[0] === "trackCustom");
  assert.equal(custom.at(-1)[0], "trackCustom");
  assert.equal(custom.at(-1)[1], "house_ad_click");
  assert.equal(custom.at(-1)[2].placement, "left");
  assert.equal(custom.at(-1)[2].target, "B0HLN1S6V6");
  assert.equal(calls(window).some(entry => entry[1] === "Purchase"), false);
  const queued = captures(window);
  assert.deepEqual(queued.at(-1), ["capture", "house_ad_click", { placement: "left", target: "B0HLN1S6V6" }]);
  const vercel = [...window.vaq].map(entry => Array.from(entry));
  assert.equal(vercel.at(-1)[1].name, "house_ad_click");
  assert.equal(vercel.at(-1)[1].data.placement, "left");
  assert.equal(vercel.at(-1)[1].data.target, "B0HLN1S6V6");
  window.happyDOM.close();

  const bare = boot("https://devildictionary.com/");
  bare.fbq = undefined;
  bare.posthog = undefined;
  bare.document.body.innerHTML = `<a data-house-ad data-house-placement="right" data-house-target="print-play" href="/print-play">Shop Print & Play</a>`;
  assert.doesNotThrow(() => {
    bare.document.querySelector("a").dispatchEvent(new bare.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  bare.happyDOM.close();

  const native = boot("https://devildictionary.com/", page => {
    page.Capacitor = { isNativePlatform: () => true };
  });
  native.document.body.innerHTML = `<a data-house-ad data-house-placement="left" data-house-target="B0HLMKP8K8" href="https://www.amazon.com/dp/B0HLMKP8K8">View on Amazon</a>`;
  assert.doesNotThrow(() => {
    native.document.querySelector("a").dispatchEvent(new native.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  assert.equal(native.fbq, undefined);
  native.happyDOM.close();
});

test("the private editor does not load analytics, the pixel, or the PostHog token", () => {
  const editor = fs.readFileSync(new URL("../editor.html", import.meta.url), "utf8");
  assert.doesNotMatch(editor, /analytics\.js|posthog|phc_yEVJ|fbevents|fbq\(|1832150057779347/);
  assert.match(fs.readFileSync(new URL("../app.js", import.meta.url), "utf8"), /ddTrack\?\.\("Game start"\)/);
  assert.match(fs.readFileSync(new URL("../app.js", import.meta.url), "utf8"), /ddTrack\?\.\("Word complete"/);
  const game = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
  assert.match(game, /ddTrack\?\.\("Daily start"/);
  assert.match(game, /ddTrack\?\.\("Daily complete"/);
  assert.match(game, /ddTrack\?\.\("Daily share"/);
  assert.match(game, /ddTrack\?\.\("Daily streak"/);
});

test("daily puzzle events reach PostHog and Vercel without a new Meta mapping", () => {
  const window = boot("https://devildictionary.com/");
  window.ddTrack("Daily start", { puzzle: 300, date: "2026-10-27", word: "HOPE" });
  window.ddTrack("Daily complete", { puzzle: 300, date: "2026-10-27", word: "HOPE", streak: 2, best: 4, misses: 1, hinted: false });
  window.ddTrack("Daily share", { method: "copy", puzzle: 300, streak: 2 });
  window.ddTrack("Daily streak", { streak: 2, best: 4, date: "2026-10-27" });
  window.ddTrack("Game start");
  assert.equal(calls(window).some(entry => entry[0] === "trackCustom" && String(entry[1]).startsWith("Daily")), false);
  assert.equal(calls(window).some(entry => entry[1] === "StartPlay"), true);
  assert.equal(calls(window).some(entry => entry[1] === "Purchase"), false);
  const names = captures(window).map(entry => entry[1]);
  assert.deepEqual(names, ["Daily start", "Daily complete", "Daily share", "Daily streak", "StartPlay"]);
  const vercel = [...window.vaq].map(entry => Array.from(entry));
  assert.deepEqual(vercel.slice(0, 4).map(entry => entry[1].name), ["Daily start", "Daily complete", "Daily share", "Daily streak"]);
  assert.equal(vercel[1][1].data.word, "HOPE");
  assert.equal(vercel[1][1].data.streak, 2);
  assert.doesNotMatch(source, /"Daily start"|"Daily complete"|"Daily share"|"Daily streak"/);
  window.happyDOM.close();
});
