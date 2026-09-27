-- D1 schema for the admin page. Run once:
--   npx wrangler d1 execute steam-purchase-replay --remote --file functions/schema.sql
-- Lists (license names, games) are stored as JSON arrays of strings.

CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  licenses TEXT NOT NULL,          -- license names as on the licenses page
  games TEXT NOT NULL,             -- games the license gives
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bundles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,              -- "April 2023 Humble Choice"
  store TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'bundle' CHECK (kind IN ('bundle', 'sub')),
  date TEXT NOT NULL,              -- YYYY-MM-DD it went on sale
  price REAL,                      -- null when unknown
  games TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS free_games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  updated_at TEXT NOT NULL
);

-- Every change the admin page makes, with the row as it was before, so it can be undone.
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tbl TEXT NOT NULL,
  row_id INTEGER,
  action TEXT NOT NULL,            -- add, edit, delete, import
  label TEXT NOT NULL DEFAULT '',
  before TEXT,                     -- JSON of the row before the change, null for add
  at TEXT NOT NULL
);
