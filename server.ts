import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';

let angularAppEngine: AngularAppEngine | undefined;

const CANONICAL_HOST = 'www.nuernberg-renegades.de';
const APEX_HOST = 'nuernberg-renegades.de';

/**
 * Nothing this handler returns may be stored by a shared cache.
 *
 * Netlify's edge cached the implicit apex->www redirect under a key that ignored the
 * host, then replayed it on the www host — where "redirect to www" is a redirect to
 * itself, so `/` and `/team` served 301 loops until the cache was purged. SSR HTML is
 * per-request anyway (theme cookie, locale path), so it must never be shared-cached.
 */
const NO_STORE = 'private, no-store, must-revalidate';

function redirect(location: string): Response {
  return new Response(null, {
    status: 301,
    headers: { location, 'cache-control': NO_STORE },
  });
}

/**
 * Apex -> www, handled here rather than by a netlify.toml rule: Netlify runs edge
 * functions before redirect rules, so this is the only layer that reliably sees the
 * request. Doing it ourselves also lets us mark the redirect no-store, which is what
 * stops it being cached and replayed on the wrong host.
 */
function canonicalHostRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.hostname !== APEX_HOST) {
    return null;
  }

  url.hostname = CANONICAL_HOST;
  return redirect(url.toString());
}

/**
 * Language used to be a `?lang=` query parameter on the same URL, which Google could not
 * index as two pages. Those URLs are indexed and linked, so redirect them permanently onto
 * the locale paths instead of dropping the equity: `?lang=en` -> `/en/...`, `?lang=de` -> `/...`.
 */
function legacyLangRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang');
  if (lang !== 'de' && lang !== 'en') {
    return null;
  }

  url.searchParams.delete('lang');

  const alreadyEnglish = url.pathname === '/en' || url.pathname.startsWith('/en/');
  if (lang === 'en' && !alreadyEnglish) {
    url.pathname = url.pathname === '/' ? '/en' : `/en${url.pathname}`;
  } else if (lang === 'de' && alreadyEnglish) {
    url.pathname = url.pathname.slice('/en'.length) || '/';
  }

  return redirect(url.toString());
}

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const redirectResponse = canonicalHostRedirect(request) ?? legacyLangRedirect(request);
  if (redirectResponse) {
    return redirectResponse;
  }

  angularAppEngine ??= new AngularAppEngine();
  const context = getContext();
  const result = await angularAppEngine.handle(request, context);
  if (!result) {
    // Angular drops routes whose loadComponent() rejects at runtime, so a genuine
    // 404 and a route that failed to load are indistinguishable here. Log the URL
    // so the difference shows up in the Netlify function logs instead of silently
    // serving 404s for real pages.
    console.warn(`[ssr] no route matched: ${new URL(request.url).pathname}`);
    return new Response('Not found', {
      status: 404,
      headers: { 'cache-control': NO_STORE },
    });
  }

  const headers = new Headers(result.headers);
  headers.set('cache-control', NO_STORE);
  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
