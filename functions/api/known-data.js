// GET /api/known-data: public. The known packs, bundles and free-to-play games the site matches against, as kept in
// the admin page. The site falls back to its built-in data/known-packages.js when this fails or is empty.

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

export async function onRequestGet({ env }) {
  try {
    const [packages, bundles, free] = await env.DB.batch([
      env.DB.prepare('SELECT licenses, games FROM packages ORDER BY id'),
      env.DB.prepare('SELECT name, store, kind, date, price, games FROM bundles ORDER BY date, name'),
      env.DB.prepare('SELECT name FROM free_games ORDER BY name'),
    ]);
    return json({
      ok: true,
      packages: packages.results.map(p => ({ licenses: JSON.parse(p.licenses), games: JSON.parse(p.games) })),
      bundles: bundles.results.map(b => ({ ...b, games: JSON.parse(b.games) })),
      free: free.results.map(f => f.name),
    }, 200, { 'Cache-Control': 'public, max-age=60' });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) }, 500);
  }
}
