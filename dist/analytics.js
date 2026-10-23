// Vercel Web Analytics for the public website.
// The insights script is served by Vercel at /_vercel/insights/script.js once
// Web Analytics is enabled for the project. Custom events go through va().
// Nothing here runs inside the Capacitor app or a file:// offline copy.
(() => {
  const native = Boolean(window.Capacitor) || location.protocol === "file:";

  if (!native) {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    const script = document.createElement("script");
    script.defer = true;
    script.src = "/_vercel/insights/script.js";
    document.head.append(script);
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

  window.ddTrack = function ddTrack(name, data) {
    if (native || !name) return;
    const event = { name: String(name).slice(0, 255) };
    const payload = cleanData(data);
    if (Object.keys(payload).length) event.data = payload;
    window.va("event", event);
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
    if (status) status.textContent = "Sending…";
    try {
      const response = await fetch(form.action || "/api/subscribe", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = await response.json().catch(() => ({}));
      if (status) {
        status.textContent = body.message || "The daily-word list is not open yet. This address was not saved.";
      }
      form.dataset.state = "refused";
      const result = body.status === "method_not_allowed" ? "method_not_allowed" : "coming_soon";
      window.ddTrack("Subscribe", { result });
    } catch {
      if (status) status.textContent = "The list could not be reached. This address was not saved.";
      form.dataset.state = "refused";
      window.ddTrack("Subscribe", { result: "unreachable" });
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
