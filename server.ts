import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';

let angularAppEngine: AngularAppEngine | undefined;

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

  return new Response(null, { status: 301, headers: { location: url.toString() } });
}

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const redirect = legacyLangRedirect(request);
  if (redirect) {
    return redirect;
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
  }
  return result || new Response('Not found', { status: 404 });
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
