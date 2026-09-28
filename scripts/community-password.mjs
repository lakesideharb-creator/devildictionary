import { randomBytes, scryptSync } from "node:crypto";
// Accept through stdin, never a shell argument (which may enter shell history).
let password = "";
for await (const chunk of process.stdin) password += chunk;
password = password.trim();
if (password.length < 16)
  throw Error("Use an editor password with at least 16 characters.");
const salt = randomBytes(16).toString("hex");
console.log(`${salt}:${scryptSync(password, salt, 64).toString("hex")}`);
