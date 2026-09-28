import fs from "node:fs";
let connection;
export async function database() {
  if (connection) return connection;
  const url = process.env.DATABASE_URL || process.env.database_DATABASE_URL;
  if (url && url !== "[SENSITIVE]") {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    connection = { query: (text, values = []) => sql.query(text, values) };
  } else if (process.env.COMMUNITY_LOCAL === "1" && !process.env.VERCEL) {
    const { DatabaseSync } = await import("node:sqlite");
    const db = new DatabaseSync(
      process.env.COMMUNITY_DB || ".community.sqlite",
    );
    db.exec(fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
    connection = {
      query: async (text, values = []) => {
        const ordered = [];
        const q = text.replace(/\$(\d+)/g, (_, n) => {
          ordered.push(values[Number(n) - 1]);
          return "?";
        });
        return db.prepare(q).all(...ordered);
      },
    };
  } else {
    throw Object.assign(
      new Error(
        "Community submissions are not open yet. Please try again later.",
      ),
      { status: 503 },
    );
  }
  return connection;
}
