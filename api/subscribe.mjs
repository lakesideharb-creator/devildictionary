// TODO(bob): this stub does not store addresses. Wire a list provider
// (Resend Audiences, Buttondown, or similar) before telling anyone they
// are subscribed, and update the privacy page once addresses are kept.
// Do not log the request body. The address is discarded.

const COMING_SOON = {
  ok: false,
  status: "coming_soon",
  message: "The daily-word list is not open yet. This address was not saved."
};

function discardBody(req) {
  if (!req || typeof req.on !== "function") return;
  req.on("data", () => {});
  req.on("end", () => {});
  if (typeof req.resume === "function") req.resume();
}

export default function handler(req, res) {
  discardBody(req);
  const method = req?.method || "POST";
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end(JSON.stringify({
      ok: false,
      status: "method_not_allowed",
      message: "Send a POST. The list is not open, and no address is saved."
    }));
    return;
  }
  res.statusCode = 501;
  res.end(JSON.stringify(COMING_SOON));
}
