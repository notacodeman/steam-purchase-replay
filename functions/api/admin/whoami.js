// GET /api/admin/whoami: who's signed in. Protected by Cloudflare Access like the rest of /api/admin, so Access has
// already made the visitor sign in and passes on their email. With ?next=/admin it sends the browser back to that
// page afterwards, which is how the admin page's Sign in button works.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// The email from the token Access adds to every request it lets through. Only read, not verified: Access has already
// checked it before the request got here.
function tokenEmail(request) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).email || null;
  } catch (_) {
    return null;
  }
}

export async function onRequestGet({ request }) {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email') || tokenEmail(request);
  if (!email) {
    // say what did arrive, to tell a path missing from the Access application from a sign-in cookie not being sent
    const seen = [
      request.headers.has('Cf-Access-Jwt-Assertion') ? 'an Access token without an email' : 'no Access token',
      /(?:^|;\s*)CF_Authorization=/.test(request.headers.get('Cookie') || '') ? 'the sign-in cookie' : 'no sign-in cookie',
    ];
    return json({
      ok: false,
      error: `This didn't come through Cloudflare Access (the request had ${seen.join(' and ')}), so /api/admin/* ` +
        "isn't protected. Add it to the Access application.",
    }, 403);
  }
  const url = new URL(request.url);
  const next = url.searchParams.get('next');
  // only paths on this site, never another domain
  if (next && /^\/(?!\/)/.test(next)) return Response.redirect(new URL(next, url).toString(), 302);
  return json({ ok: true, email });
}
