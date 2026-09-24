/**
 * `Access-Control-Allow-Methods` is the response header; `Access-Control-Request-Method`
 * is what the browser sends on the preflight. An earlier value here was the request
 * header's name (pluralised), so the preflight reply never actually declared POST — the
 * forms only worked because the Supabase gateway fills the gap. A JSON body makes these
 * non-simple requests, so the preflight has to be correct on its own.
 *
 * The reply used to be `Access-Control-Allow-Origin: *`. reCAPTCHA already limits abuse,
 * but this Supabase project is now shared with the performance app
 * (nbg-renegades/renegades-performance), so form spam from any origin burns Free-tier
 * quota that both apps depend on. Echoing only known origins makes a browser refuse to
 * hand the response back to a page we do not serve.
 *
 * The allow list comes from HOMEPAGE_ALLOWED_ORIGINS, a comma-separated list. It is
 * deliberately NOT called ALLOWED_ORIGINS: function secrets are project-wide, and the
 * performance app already owns a secret by that name holding *its* origins. Sharing it
 * would have each app's functions rejecting the other app's site.
 */
const DEV_ORIGINS = ['http://localhost:4200', 'http://localhost:4000'];

const SITE_ORIGINS = [
  'https://www.nuernberg-renegades.de',
  'https://nuernberg-renegades.de',
  'https://*.netlify.app',
];

const configured = (Deno.env.get('HOMEPAGE_ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const origins = configured.length > 0 ? configured : [...SITE_ORIGINS, ...DEV_ORIGINS];

function isAllowed(origin: string): boolean {
  return origins.some((allowed) => {
    if (allowed === origin) return true;

    // "https://*.netlify.app" matches any subdomain of netlify.app — that is what deploy
    // previews are — but never the apex and never a lookalike like evil-netlify.app.
    const wildcard = allowed.match(/^(https?:\/\/)?\*\.(.+)$/);
    if (!wildcard) return false;

    const scheme = wildcard[1] ?? 'https://';
    const domain = wildcard[2];
    return origin.startsWith(scheme) && origin.slice(scheme.length).endsWith(`.${domain}`);
  });
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';

  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    // Responses now differ by request origin, so a cache must key on it.
    Vary: 'Origin',
  };

  // Omitting the header entirely is what makes the browser block a disallowed origin.
  if (origin && isAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}
