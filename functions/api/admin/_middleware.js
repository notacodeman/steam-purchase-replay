// Everything under /api/admin is meant to sit behind Cloudflare Access, which adds this header to requests it let
// through. Refusing requests without it keeps the API closed if the Access rule is ever removed or mistyped.
// For local development with `wrangler pages dev`, set ADMIN_DEV=1 in .dev.vars.
export async function onRequest({ request, env, next }) {
  if (env.ADMIN_DEV === '1' || request.headers.get('Cf-Access-Jwt-Assertion')) return next();
  return new Response(JSON.stringify({ ok: false, error: 'Sign in through Cloudflare Access first.' }), {
    status: 401, headers: { 'Content-Type': 'application/json' },
  });
}
