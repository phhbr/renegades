import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';

let angularAppEngine: AngularAppEngine | undefined;

/**
 * Nothing this handler returns may be stored by a shared cache.
 *
 * Netlify's edge cached the apex->www redirect under a key that ignored the host, then
 * replayed it on the www host — where "redirect to www" is a redirect to itself, so `/`
 * and `/team` served 301 loops until the cache was purged. SSR HTML is per-request
 * anyway (theme cookie, locale path), so it must never be shared-cached.
 */
const NO_STORE = 'private, no-store, must-revalidate';

function redirect(location: string): Response {
  return new Response(null, {
    status: 301,
    headers: { location, 'cache-control': NO_STORE },
  });
}

/**
 * Language used to be a `?lang=` query parameter on the same URL, which Google could not
 * index as two pages. Those URLs are indexed and linked, so move them onto the locale
 * paths instead of dropping the equity: `?lang=en` -> `/en/...`, `?lang=de` -> `/...`.
 */
function legacyLangRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang');
  if (lang !== 'de' && lang !== 'en') {
    return null;
  }

  const isEnglishPath = url.pathname === '/en' || url.pathname.startsWith('/en/');
  let pathname = url.pathname;
  if (lang === 'en' && !isEnglishPath) {
    pathname = url.pathname === '/' ? '/en' : `/en${url.pathname}`;
  } else if (lang === 'de' && isEnglishPath) {
    pathname = url.pathname.slice('/en'.length) || '/';
  }

  // Netlify re-appends the incoming query string to the Location header of a redirect,
  // so `?lang=` is handed straight back to us and a redirect that exists only to strip
  // it loops forever. Redirect only when the path actually changes; where it does not,
  // serve the page and let the canonical tag consolidate the leftover `?lang=` URL.
  if (pathname === url.pathname) {
    return null;
  }

  url.pathname = pathname;
  url.searchParams.delete('lang');
  return redirect(url.toString());
}

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const redirectResponse = legacyLangRedirect(request);
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
