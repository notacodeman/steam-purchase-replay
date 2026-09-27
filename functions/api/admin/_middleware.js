// Runs before every /api/admin/* route. Turns a missing database setup into a message the admin page can show,
// instead of Cloudflare's bare 500 page.

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequest({ env, next, request }) {
  if (!new URL(request.url).pathname.endsWith('/whoami') && !env.DB) {
    return json({ ok: false, error: "The site has no D1 database bound as DB. In the Pages project: Settings → Bindings → " +
      "add a D1 database binding named DB (database steam-purchase-replay), then redeploy." }, 500);
  }
  try {
    return await next();
  } catch (err) {
    const message = String(err && err.message || err);
    if (/no such table/i.test(message)) {
      return json({ ok: false, error: "The database has no tables yet. Paste functions/schema.sql into the D1 database's " +
        `Console and run it. (${message})` }, 500);
    }
    return json({ ok: false, error: message }, 500);
  }
}
