import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { handle } from "../server/community.mjs";
const port = Number(process.env.PORT || 4176);
process.env.COMMUNITY_LOCAL = "1";
process.env.COMMUNITY_ORIGIN = `http://127.0.0.1:${port}`;
process.env.COMMUNITY_SESSION_SECRET ||= randomBytes(32).toString("hex");
if (!process.env.COMMUNITY_ADMIN_HASH) {
  const salt = randomBytes(16).toString("hex");
  const password = randomBytes(18).toString("base64url");
  process.env.COMMUNITY_ADMIN_HASH = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  await fs.writeFile(".community-editor-password", password, { mode: 0o600 });
  console.log(
    "Local editor password saved in .community-editor-password (local preview only).",
  );
}
const root = path.resolve("dist");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
};
http
  .createServer(async (req, res) => {
    if (req.url.startsWith("/api/community")) return handle(req, res);
    try {
      let name = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (name === "/") name = "/index.html";
      if (!path.extname(name)) name += ".html";
      const file = path.resolve(root, "." + name);
      if (!file.startsWith(root + path.sep)) throw Error();
      const data = await fs.readFile(file);
      res.setHeader(
        "Content-Type",
        types[path.extname(file)] || "application/octet-stream",
      );
      res.end(data);
    } catch {
      res.statusCode = 404;
      res.end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Community preview: http://127.0.0.1:${port}/community.html`),
  );
