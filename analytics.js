// Vercel Web Analytics and the Meta Pixel for the public website.
// The insights script is served by Vercel at /_vercel/insights/script.js once
// Web Analytics is enabled for the project. Custom events go through va().
// The Meta base code (init + PageView) is installed here, once, for every
// public page that already loads this file. fbevents.js is async.
// Nothing here runs inside the Capacitor app or a file:// offline copy.
//
// Purchase is not sent: checkout finishes on Creem and does not return a
// reliable confirmation on this origin. The noscript PageView image from
// Meta's snippet is omitted; this script is the only install, and a
// noscript tag written by JavaScript never runs for visitors without it.
(() => {
  const META_PIXEL_ID = "1832150057779347";
  const META_CUSTOM_EVENTS = {
    "Game start": "StartPlay",
    "Word complete": "CompleteWord"
  };
  const native = Boolean(window.Capacitor) || location.protocol === "file:";

  if (!native) {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    const script = document.createElement("script");
    script.defer = true;
    script.src = "/_vercel/insights/script.js";
    document.head.append(script);
    installMetaPixel();
  }

  function installMetaPixel() {
    if (window.fbq) return;
    const fbq = window.fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    const pixel = document.createElement("script");
    pixel.async = true;
    pixel.src = "https://connect.facebook.net/en_US/fbevents.js";
    const first = document.getElementsByTagName("script")[0];
    if (first && first.parentNode) first.parentNode.insertBefore(pixel, first);
    else document.head.append(pixel);
    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
  }

  function cleanData(data) {
    const clean = {};
    if (!data || typeof data !== "object") return clean;
    for (const [key, value] of Object.entries(data)) {
      if (key === "email" || key === "address" || key === "definition" || key === "en") continue;
      if (value == null || typeof value === "number" || typeof value === "boolean") {
        clean[String(key).slice(0, 255)] = value;
      } else if (typeof value === "string") {
        clean[String(key).slice(0, 255)] = value.slice(0, 255);
      }
    }
    return clean;
  }

  function metaData(data) {
    const clean = cleanData(data);
    for (const [key, value] of Object.entries(clean)) {
      if (typeof value === "boolean") clean[key] = value ? "true" : "false";
    }
    return clean;
  }

  function metaTrack(method, name, data) {
    if (native || typeof window.fbq !== "function" || !name) return;
    const payload = metaData(data);
    if (Object.keys(payload).length) window.fbq(method, name, payload);
    else window.fbq(method, name);
  }

  window.ddTrack = function ddTrack(name, data) {
    if (native || !name) return;
    const event = { name: String(name).slice(0, 255) };
    const payload = cleanData(data);
    if (Object.keys(payload).length) event.data = payload;
    window.va("event", event);
    const custom = META_CUSTOM_EVENTS[event.name];
    if (custom) metaTrack("trackCustom", custom, payload);
  };

  function hideNativeSubscribe() {
    if (!window.Capacitor) return;
    document.querySelectorAll("[data-subscribe]").forEach(form => form.remove());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hideNativeSubscribe);
  else hideNativeSubscribe();

  document.addEventListener("click", event => {
    const link = event.target.closest?.("a");
    if (!link) return;
    if (link.dataset.track === "share") {
      window.ddTrack("Share", {
        method: link.dataset.shareMethod || "x",
        place: link.dataset.sharePlace || "page"
      });
      return;
    }
    const href = link.href || "";
    const purchase = link.matches("[data-shop-open], .shop-buy")
      || href.includes("creem.io/payment")
      || link.closest(".shop-result");
    if (purchase) {
      let place = "link";
      if (link.closest(".shop-mobile")) place = "mobile";
      else if (link.closest(".shop-banner")) place = "banner";
      else if (link.classList.contains("shop-buy") || href.includes("creem.io/payment")) place = "checkout";
      else if (link.closest(".shop-result")) place = "result";
      window.ddTrack("Purchase CTA", { place });
      return;
    }
    if (!link.closest(".social-links, .legal-social")) return;
    const network = link.dataset.network
      || (href.includes("youtube.com") ? "youtube"
        : href.includes("instagram.com") ? "instagram"
        : href.includes("x.com") || href.includes("twitter.com") ? "x"
        : "other");
    window.ddTrack("Social click", { network, action: "profile" });
  });

  document.addEventListener("submit", async event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches("[data-subscribe]")) return;
    event.preventDefault();
    const status = form.querySelector("[data-subscribe-status]");
    const button = form.querySelector("button[type='submit']");
    const email = String(new FormData(form).get("email") || "");
    form.dataset.state = "pending";
    if (button) button.disabled = true;
    if (status) status.textContent = "Saving your address…";
    try {
      const response = await fetch(form.action || "/api/subscribe", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = await response.json().catch(() => ({}));
      const accepted = response.ok && body.ok === true && body.status === "subscribed";
      if (status) {
        status.textContent = accepted
          ? (body.message || "You’re on the list. Each morning brings one letter with the day’s word, and a link to play it.")
          : (body.message || "The list could not be reached. This address was not saved.");
      }
      form.dataset.state = accepted ? "success" : "refused";
      const result = accepted ? "subscribed" : String(body.status || "error").slice(0, 40);
      window.ddTrack("Subscribe", { result });
      if (accepted) metaTrack("track", "Lead", { content_name: "daily letter" });
    } catch {
      if (status) status.textContent = "The list could not be reached. This address was not saved.";
      form.dataset.state = "refused";
      window.ddTrack("Subscribe", { result: "unreachable" });
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
