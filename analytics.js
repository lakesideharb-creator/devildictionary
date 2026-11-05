// Vercel Web Analytics, the Meta Pixel, and PostHog for the public website.
// The insights script is served by Vercel at /_vercel/insights/script.js once
// Web Analytics is enabled for the project. Custom events go through va().
// The Meta base code (init + PageView) is installed here, once, for every
// public page that already loads this file. fbevents.js is async.
// PostHog is project 684727 on US Cloud. The loader is PostHog's array.js stub,
// which pulls https://us-assets.i.posthog.com/static/array.js from api_host
// https://us.i.posthog.com. capture_pageview is the boolean true, so the SDK
// records one $pageview per document load. This file does not send a second
// PostHog pageview of its own. The 2026-08-30 default of "history_change" is
// overridden so a community history.replaceState does not add a second page view.
// Nothing here runs inside the Capacitor app or a file:// offline copy.
// editor.html does not load this file.
//
// Purchase is not sent to Meta: checkout finishes on Creem and does not return a
// reliable confirmation on this origin. The noscript PageView image from
// Meta's snippet is omitted; this script is the only install, and a
// noscript tag written by JavaScript never runs for visitors without it.
(() => {
  const META_PIXEL_ID = "1832150057779347";
  const META_CUSTOM_EVENTS = {
    "Game start": "StartPlay",
    "Word complete": "CompleteWord",
    "house_ad_click": "house_ad_click"
  };
  // Creem product ids behind the shop dialog and Print & Play buy links.
  const CHECKOUT_PRODUCTS = {
    prod_XEhxj6wfeIfoNzHcvuVxR: { product: "adult", price: 2.99 },
    prod_5x9nABognL3Zp8viH8hiCS: { product: "family", price: 2.99 },
    prod_GdeLw30T7sPq6MO1UQdsG: { product: "bundle", price: 4.99 }
  };
  const POSTHOG_KEY = "phc_yEVJFtudPsoM57mHjf9MgFontV6iZNptaDjCUBDD5Puh";
  const POSTHOG_HOST = "https://us.i.posthog.com";
  const STRIPPED_KEYS = new Set(["email", "address", "definition", "en"]);
  const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const native = Boolean(window.Capacitor) || location.protocol === "file:";

  if (!native) {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    const script = document.createElement("script");
    script.defer = true;
    script.src = "/_vercel/insights/script.js";
    document.head.append(script);
    installMetaPixel();
    installPostHog();
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

  function installPostHog() {
    if (window.posthog && window.posthog.__SV) return;
    // Official PostHog snippet. api_host decides the asset host: the US ingestion
    // host becomes us-assets.i.posthog.com. Keep this on US Cloud.
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: "https://us.posthog.com",
      defaults: "2026-08-30",
      // One $pageview on load. Not "history_change", and not a second manual capture.
      capture_pageview: true,
      capture_pageleave: "if_capture_pageview",
      autocapture: false,
      capture_dead_clicks: false,
      rageclick: false,
      capture_exceptions: false,
      capture_heatmaps: false,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: "identified_only",
      before_send: scrubPostHogEvent
    });
  }

  function cleanData(data) {
    const clean = {};
    if (!data || typeof data !== "object") return clean;
    for (const [key, value] of Object.entries(data)) {
      if (STRIPPED_KEYS.has(key)) continue;
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

  function scrubPostHogValue(value) {
    if (typeof value === "string") return value.replace(EMAIL_PATTERN, "[redacted]");
    if (Array.isArray(value)) return value.map(scrubPostHogValue);
    if (value && typeof value === "object") return scrubPostHogBag(value);
    return value;
  }

  function scrubPostHogBag(data) {
    const clean = {};
    for (const [key, value] of Object.entries(data)) {
      if (STRIPPED_KEYS.has(key)) continue;
      clean[key] = scrubPostHogValue(value);
    }
    return clean;
  }

  // Last line of defense once array.js is running, including any property the
  // SDK attaches. cleanData already strips the same keys on the way in.
  function scrubPostHogEvent(event) {
    if (!event || typeof event !== "object") return event;
    if (event.properties && typeof event.properties === "object") {
      event.properties = scrubPostHogBag(event.properties);
    }
    for (const key of ["$set", "$set_once"]) {
      if (event[key] && typeof event[key] === "object") event[key] = scrubPostHogBag(event[key]);
    }
    return event;
  }

  function posthogCapture(name, data) {
    if (native || !name || typeof window.posthog?.capture !== "function") return;
    const payload = cleanData(data);
    if (Object.keys(payload).length) window.posthog.capture(name, payload);
    else window.posthog.capture(name);
  }

  // One PostHog event per ddTrack call. Game names match the Meta Pixel.
  // A successful daily-letter signup is subscribe_success only — not also a
  // second "Subscribe" or "lead" event. Meta's Lead is sent separately.
  function mirrorToPostHog(name, payload) {
    if (name === "Game start") {
      posthogCapture("StartPlay");
      return;
    }
    if (name === "Word complete") {
      posthogCapture("CompleteWord", payload);
      return;
    }
    if (name === "Subscribe") {
      if (payload.result === "subscribed") posthogCapture("subscribe_success", { content_name: "daily letter" });
      return;
    }
    posthogCapture(name, payload);
  }

  window.ddTrack = function ddTrack(name, data) {
    if (native || !name) return;
    const event = { name: String(name).slice(0, 255) };
    const payload = cleanData(data);
    if (Object.keys(payload).length) event.data = payload;
    window.va("event", event);
    const custom = META_CUSTOM_EVENTS[event.name];
    if (custom) metaTrack("trackCustom", custom, payload);
    mirrorToPostHog(event.name, payload);
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
    // Shop notes keep the existing Purchase CTA / house-ad events and add their own.
    // These names are not in META_CUSTOM_EVENTS, so Meta's mapping stays as it is.
    if (link.matches("[data-shop-nudge]")) {
      window.ddTrack("shop_nudge_click", {
        moment: link.dataset.shopNudge || "",
        target: link.dataset.shopNudgeTarget || link.dataset.houseTarget || ""
      });
    }
    // First-party gutter ads on the game page. ddTrack no-ops in the native
    // shell and skips Meta or PostHog when those stubs are missing.
    if (link.matches("[data-house-ad]")) {
      window.ddTrack("house_ad_click", {
        placement: link.dataset.housePlacement || "",
        target: link.dataset.houseTarget || ""
      });
      return;
    }
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
      if (link.closest(".shop-nudge")) place = "nudge";
      else if (link.closest(".shop-mobile")) place = "mobile";
      else if (link.closest(".shop-banner")) place = "banner";
      else if (link.classList.contains("shop-buy") || href.includes("creem.io/payment")) place = "checkout";
      else if (link.closest(".shop-result")) place = "result";
      const data = { place };
      if (place === "checkout") {
        const id = (href.match(/prod_[A-Za-z0-9]+/) || [""])[0];
        Object.assign(data, CHECKOUT_PRODUCTS[id] || { product: id || "unknown" });
        data.page = location.pathname;
      }
      window.ddTrack("Purchase CTA", data);
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
