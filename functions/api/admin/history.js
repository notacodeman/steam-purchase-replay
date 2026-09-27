// GET /api/admin/history: the last 100 changes made in the admin page, newest first.

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT * FROM history ORDER BY id DESC LIMIT 100').all();
  return new Response(JSON.stringify({ ok: true, rows: results }), { headers: { 'Content-Type': 'application/json' } });
}
