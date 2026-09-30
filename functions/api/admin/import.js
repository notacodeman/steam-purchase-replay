// POST /api/admin/import { packages: [[licenses, games]], bundles: [...], free: [names] }. Protected by Cloudflare Access.
// Replaces all three lists at once, used to load the built-in data/known-packages.js into an empty database or to
// start over from it. The old lists are kept in `history` as one entry per list.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const strings = value => Array.isArray(value) && value.every(v => typeof v === 'string' && v.trim());

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  const ok = body
    && Array.isArray(body.packages) && body.packages.every(p => Array.isArray(p) && strings(p[0]) && strings(p[1]))
    && Array.isArray(body.bundles) && body.bundles.every(b => b.name && /^\d{4}-\d{2}-\d{2}$/.test(b.date) && strings(b.games))
    && strings(body.free);
  if (!ok) return json({ ok: false, error: 'Expected { packages, bundles, free } in the format of data/known-packages.js.' }, 400);

  const now = new Date().toISOString();
  const [oldPackages, oldBundles, oldFree] = await env.DB.batch([
    env.DB.prepare('SELECT * FROM packages'), env.DB.prepare('SELECT * FROM bundles'), env.DB.prepare('SELECT * FROM free_games'),
  ]);
  const log = (tbl, rows) => env.DB.prepare('INSERT INTO history (tbl, action, label, before, at) VALUES (?, ?, ?, ?, ?)')
    .bind(tbl, 'import', `replaced ${rows.length} rows`, JSON.stringify(rows), now);

  await env.DB.batch([
    log('packages', oldPackages.results), log('bundles', oldBundles.results), log('free_games', oldFree.results),
    env.DB.prepare('DELETE FROM packages'), env.DB.prepare('DELETE FROM bundles'), env.DB.prepare('DELETE FROM free_games'),
    // One INSERT per table reading a JSON array, so the long bundle list stays well under D1's per-request query limit.
    env.DB.prepare(`INSERT INTO packages (licenses, games, note, updated_at)
      SELECT json_extract(value, '$[0]'), json_extract(value, '$[1]'), '', ?2 FROM json_each(?1)`)
      .bind(JSON.stringify(body.packages), now),
    env.DB.prepare(`INSERT INTO bundles (name, store, kind, date, ends, price, games, note, updated_at)
      SELECT json_extract(value, '$.name'), json_extract(value, '$.store'), json_extract(value, '$.kind'),
        json_extract(value, '$.date'), json_extract(value, '$.ends'), json_extract(value, '$.price'),
        json_extract(value, '$.games'), '', ?2 FROM json_each(?1)`)
      .bind(JSON.stringify(body.bundles.map(b => ({
        name: b.name, store: b.store || '', kind: ['sub', 'giveaway'].includes(b.kind) ? b.kind : 'bundle', date: b.date,
        ends: /^\d{4}-\d{2}-\d{2}$/.test(b.ends || '') ? b.ends : null, price: b.price ?? null, games: JSON.stringify(b.games),
      }))), now),
    env.DB.prepare('INSERT INTO free_games (name, updated_at) SELECT value, ?2 FROM json_each(?1)')
      .bind(JSON.stringify([...new Set(body.free)]), now),
  ]);
  return json({ ok: true, packages: body.packages.length, bundles: body.bundles.length, free: body.free.length });
}
