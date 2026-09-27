// GET /api/admin/whoami: who's signed in. Protected by Cloudflare Access like the rest of /api/admin, so Access has
// already made the visitor sign in and passes on their email. With ?next=/admin it sends the browser back to that
// page afterwards, which is how the admin page's Sign in button works.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function onRequestGet({ request }) {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (!email) {
    return json({ ok: false, error: "This didn't come through Cloudflare Access, so /api/admin/* isn't protected. Add it to the Access application." }, 403);
  }
  const url = new URL(request.url);
  const next = url.searchParams.get('next');
  // only paths on this site, never another domain
  if (next && /^\/(?!\/)/.test(next)) return Response.redirect(new URL(next, url).toString(), 302);
  return json({ ok: true, email });
}
