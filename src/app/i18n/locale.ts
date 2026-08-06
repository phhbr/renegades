/**
 * Locale URL scheme.
 *
 * German is served from the root (`/team`), English from an `/en` prefix (`/en/team`).
 * Each locale therefore has its own indexable URL with a self-referencing canonical,
 * which is what makes hreflang clusters valid — the old `?lang=` variants all
 * canonicalised back to the German URL, so English was never indexed.
 */
export type Lang = 'de' | 'en';

export const DEFAULT_LANG: Lang = 'de';
export const LANGS: readonly Lang[] = ['de', 'en'];

/** Locale prefix for non-default languages, without a trailing slash. */
export const EN_PREFIX = '/en';

/** Canonical origin. Production redirects the apex domain to www, so every URL we emit uses www. */
export const SITE_ORIGIN = 'https://www.nuernberg-renegades.de';

/** Reads the language out of a URL path — the single source of truth for the active language. */
export function langFromPath(path: string | null | undefined): Lang {
  if (!path) return DEFAULT_LANG;
  const pathname = path.split(/[?#]/)[0];
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : DEFAULT_LANG;
}

/** Strips the locale prefix, returning the language-neutral path (always starting with `/`). */
export function neutralPath(path: string): string {
  const [pathname, ...rest] = path.split(/(?=[?#])/);
  const stripped = langFromPath(pathname) === 'en' ? pathname.slice(EN_PREFIX.length) || '/' : pathname;
  return (stripped.startsWith('/') ? stripped : `/${stripped}`) + rest.join('');
}

/** Maps a language-neutral path onto a locale, e.g. ('/team', 'en') -> '/en/team'. */
export function localizePath(path: string, lang: Lang): string {
  const neutral = neutralPath(path);
  if (lang === DEFAULT_LANG) return neutral;
  return neutral === '/' ? EN_PREFIX : `${EN_PREFIX}${neutral}`;
}

/** Absolute URL for a language-neutral path in a given locale. */
export function localizedUrl(path: string, lang: Lang): string {
  return `${SITE_ORIGIN}${localizePath(path, lang)}`;
}
