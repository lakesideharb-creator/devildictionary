import fs from "node:fs";
import { database } from "../server/db.mjs";
if (!process.env.DATABASE_URL && !process.env.database_DATABASE_URL)
  throw Error(
    "Set DATABASE_URL to the preview database before running migrations.",
  );
const db = await database();
for (const statement of fs
  .readFileSync(new URL("../server/schema.sql", import.meta.url), "utf8")
  .split(";")
  .filter((x) => x.trim()))
  await db.query(statement);
console.log("Community schema ready.");
