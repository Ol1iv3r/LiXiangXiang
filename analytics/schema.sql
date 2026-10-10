CREATE TABLE IF NOT EXISTS regions (
  country TEXT PRIMARY KEY,
  visits INTEGER NOT NULL DEFAULT 0 CHECK (visits >= 0)
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_created_at ON sessions(created_at);
