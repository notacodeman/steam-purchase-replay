-- One-time change to the live D1 database for free key giveaways (kind 'giveaway' and the ends column), then the
-- Dwarven Realms giveaways. SQLite can't change a CHECK constraint in place, so the bundles table is rebuilt with the
-- same ids. Run once, before deploying the code that reads `ends`:
--   npx wrangler d1 execute <database-name> --remote --file functions/migrate-2026-09-giveaways.sql
-- (Until it's run, /api/known-data fails and the site falls back to data/known-packages.js, which already has them.)

CREATE TABLE bundles_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'bundle' CHECK (kind IN ('bundle', 'sub', 'giveaway')),
  date TEXT NOT NULL,
  ends TEXT,
  price REAL,
  games TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
INSERT INTO bundles_new (id, name, store, kind, date, price, games, note, updated_at)
  SELECT id, name, store, kind, date, price, games, note, updated_at FROM bundles;
DROP TABLE bundles;
ALTER TABLE bundles_new RENAME TO bundles;

INSERT INTO bundles (name, store, kind, date, ends, price, games, note, updated_at) VALUES
  ('Dwarven Realms (Alienware Arena giveaway)', 'Alienware Arena', 'giveaway', '2026-07-16', '2026-08-23', 0,
   '["Dwarven Realms"]', 'Reported from Jul 16, 2026, while keys lasted; end date not known, so it runs up to the AMD one.',
   strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('Dwarven Realms (AMD Gaming giveaway)', 'AMD Gaming', 'giveaway', '2026-08-24', '2026-08-28', 0,
   '["Dwarven Realms"]', 'Posted Aug 24-25, 2026; expired by Aug 28.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
INSERT INTO history (tbl, action, label, before, at) VALUES
  ('bundles', 'add', 'Dwarven Realms giveaways (migration)', NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
