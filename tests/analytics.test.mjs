import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Window } from "happy-dom";

const source = fs.readFileSync(new URL("../analytics.js", import.meta.url), "utf8");
const PIXEL_ID = "1832150057779347";

function boot(url, setup) {
  const window = new Window({
    url,
    settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true }
  });
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

test("the public site queues Meta init and PageView from an async script", () => {
  const window = boot("https://devildictionary.com/");
  const pixel = pixelScript(window);
  assert.equal(pixel.async, true);
  assert.equal(pixel.src, "https://connect.facebook.net/en_US/fbevents.js");
  const vercel = [...window.document.scripts].find(script => String(script.src).includes("/_vercel/insights/script.js"));
  assert.equal(vercel.defer, true);
  const queued = calls(window);
  assert.deepEqual(queued[0], ["init", PIXEL_ID]);
  assert.deepEqual(queued[1], ["track", "PageView"]);
  assert.equal(queued.some(entry => entry.includes("Purchase")), false);
  window.happyDOM.close();
});

test("the Capacitor app and file copies do not install the pixel", () => {
  const native = boot("https://devildictionary.com/", window => {
    window.Capacitor = { isNativePlatform: () => true };
  });
  assert.equal(native.fbq, undefined);
  assert.equal(pixelScript(native), undefined);
  native.ddTrack("Game start");
  native.happyDOM.close();

  const offline = boot("file:///The-Devils-Dictionary.html");
  assert.equal(offline.fbq, undefined);
  assert.equal(pixelScript(offline), undefined);
  offline.happyDOM.close();
});

test("game events map to StartPlay and CompleteWord without email or a purchase", () => {
  const window = boot("https://devildictionary.com/");
  window.ddTrack("Game start");
  window.ddTrack("Word complete", {
    word: "HOPE",
    tier: 1,
    fresh: true,
    email: "person@example.com",
    en: "A definition that must stay off the wire."
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
  window.happyDOM.close();
});

test("a buy link is not reported as a Meta Purchase", () => {
  const window = boot("https://devildictionary.com/");
  window.document.body.innerHTML = `<a class="shop-buy" href="https://www.creem.io/payment/prod_example">Buy</a>`;
  window.document.querySelector("a").dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(calls(window).some(entry => entry[1] === "Purchase"), false);
  window.happyDOM.close();
});

test("Lead fires only after Resend accepts the address, and never includes it", async () => {
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
  assert.equal(form.dataset.state, "success");
  window.happyDOM.close();
});

test("a refused or unreachable signup does not fire Lead", async () => {
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
  assert.equal(refused.document.querySelector("form").dataset.state, "refused");
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
  assert.equal(offline.document.querySelector("form").dataset.state, "refused");
  offline.happyDOM.close();
});
