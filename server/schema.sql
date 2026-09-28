CREATE TABLE IF NOT EXISTS community_entries (id TEXT PRIMARY KEY, word TEXT NOT NULL, pos TEXT NOT NULL, definition TEXT NOT NULL, author TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected','removed')), created BIGINT NOT NULL, updated BIGINT NOT NULL, consent TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS community_status ON community_entries(status,created);
CREATE TABLE IF NOT EXISTS community_reports (id TEXT PRIMARY KEY, entry_id TEXT NOT NULL, reason TEXT NOT NULL, created BIGINT NOT NULL, status TEXT NOT NULL DEFAULT 'open');
CREATE TABLE IF NOT EXISTS community_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS community_sessions (token TEXT PRIMARY KEY, expires BIGINT NOT NULL);
