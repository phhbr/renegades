# Nürnberg Renegades e.V. Website

Official website for the Nürnberg Renegades Flag Football Club.

[![Deployment Status](https://api.netlify.com/api/v1/badges/7159a5d4-71cc-4595-b0e3-c312174ba716/deploy-status)](https://app.netlify.com/sites/renegades-relaunch/deploys)

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Angular 20 with SSR |
| Styling | TailwindCSS |
| Database & Auth | Supabase (form submissions only) |
| Email | Resend (via Supabase Edge Functions) |
| Hosting | Netlify (Edge Functions + CDN) |
| Analytics | Umami |
| i18n | Custom `TranslatePipe` + `LanguageService`, DE at `/`, EN at `/en` (URL decides the language) |

## Architecture

### Rendering strategy

The app uses full Angular SSR (no build-time prerendering) configured in `src/app/app.config.server.ts` — every route renders on the server per request:

| Route | Mode |
| --- | --- |
| `/` | Server |
| `/team` | Server |
| `/club` | Server |
| `/training` | Server |
| `/ergebnisse`, `/ergebnisse/:team`, `/ergebnisse/:team/:tab` | Server |
| `/sponsoring` | Server |
| `/contact` | Server |
| `/faq` | Server |
| `/impressum` | Server |
| `/datenschutz` | Server |
| `/en/*` (same tree, English) | Server |

### Locale URLs

German is served from the root, English from an `/en` prefix — `/training` and `/en/training` are
separate, indexable URLs, each with a self-referencing canonical and a reciprocal hreflang pair.
The URL is the only source of truth for the active language: cookies and `Accept-Language` no
longer swap the content, because two languages on one URL meant Google could index only one of
them. `src/app/i18n/locale.ts` holds the scheme, `LocalePathPipe` keeps `routerLink`s inside the
active locale, and `server.ts` 301-redirects the legacy `?lang=` URLs onto the new paths.

All routes render on the server for every request (`RenderMode.Server`) rather than being prerendered at build time. This is required because the theme preference is resolved from request cookies and headers (`Sec-CH-Prefers-Color-Scheme`) so the very first response is already in the visitor's theme — something build-time prerendering can't do per-request.

### Build output

```text
dist/demo/
├── browser/          # Static assets (served from CDN)
│   ├── index.csr.html     # CSR shell, used as fallback
│   ├── llms.txt            # AI-agent discovery file
│   ├── robots.txt / sitemap.xml
│   └── *.js / *.css       # Hashed asset bundles
└── server/           # SSR server bundle (deployed as Netlify Edge Function)
    ├── server.mjs         # Entry point — handles every request
    └── main.server.mjs    # Angular server bootstrap
```

### Request flow on Netlify

```text
Browser request
    │
    ├── Any page route (/, /team, /club, /training, /ergebnisse, /faq, ...)
    │       └── Netlify Edge Function (server.mjs) → SSR HTML → browser hydrates
    │
    └── Static assets (*.js, *.css, images, llms.txt, robots.txt, sitemap.xml)
            └── Netlify CDN
```

### Key SSR files

| File | Purpose |
| --- | --- |
| `server.ts` | Exports `netlifyAppEngineHandler`/`reqHandler` — invoked by the Netlify Edge Function runtime, not a standalone listener |
| `src/main.server.ts` | Server bootstrap entry point |
| `src/app/app.config.ts` | Shared `ApplicationConfig` (providers used on both client and server) |
| `src/app/app.config.server.ts` | Server-only providers: route render modes |
| `netlify.toml` | Netlify build config + `@netlify/angular-runtime` plugin |

## Project structure

```text
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── club/              # Club membership form
│   │   │   ├── contact/           # Contact form
│   │   │   ├── cookie-consent/    # GDPR cookie banner
│   │   │   ├── cookie-settings/   # Cookie preference page
│   │   │   ├── faq/               # FAQ page with FAQPage JSON-LD schema
│   │   │   ├── footer/
│   │   │   ├── home/
│   │   │   ├── language-switcher/
│   │   │   ├── legal/             # Impressum + Datenschutz
│   │   │   ├── navbar/
│   │   │   ├── responsive-image/
│   │   │   ├── results/           # Results/standings for both teams
│   │   │   ├── sponsoring/
│   │   │   ├── team/
│   │   │   └── training/          # Training info + tryout form
│   │   ├── services/
│   │   │   ├── analytics.service.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── cookie-consent.service.ts
│   │   │   ├── language.service.ts   # Language comes from the URL (/ = de, /en = en)
│   │   │   ├── membership.service.ts
│   │   │   ├── meta.service.ts       # Per-locale canonical + hreflang, meta tags, JSON-LD
│   │   │   ├── recaptcha.service.ts
│   │   │   ├── sponsor.service.ts    # Reads src/assets/data/sponsors.json
│   │   │   ├── storage.service.ts    # localStorage + cookie wrapper (SSR-safe)
│   │   │   ├── supabase.service.ts
│   │   │   ├── team.service.ts       # Reads src/assets/data/team-members.json
│   │   │   └── tryout.service.ts
│   │   ├── i18n/                  # Translation dictionaries (DE/EN)
│   │   ├── pipes/
│   │   ├── app.component.ts
│   │   ├── app.config.ts          # Shared providers
│   │   ├── app.config.server.ts   # Server providers + render modes
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── data/                  # team-members.json, sponsors.json
│   │   └── images/
│   ├── environments/
│   │   └── environment.ts         # Only environment file — ships to prod as-is
│   ├── llms.txt                    # AI-agent discovery file
│   └── global_styles.css
├── supabase/
│   ├── config.toml                # Project ref + per-function settings (committed)
│   ├── migrations/                # heartbeat table only — see Keepalive below
│   └── functions/
│       ├── send-contact-email/           # Contact form → Resend
│       ├── send-membership-application/  # Membership form → Resend
│       └── send-tryout-email/            # Tryout request → Resend
├── server.ts                      # SSR server entry
├── netlify.toml
└── tailwind.config.js
```

## Development

### Prerequisites

- Node.js 20+
- Angular CLI 20: `npm install -g @angular/cli`

### Setup

```bash
npm install
```

No `.env` file is needed. The Supabase URL, Supabase anon key and reCAPTCHA site key are
public values that end up in the browser bundle regardless, so they are committed in
`src/environments/environment.ts` and used for both development and production.

`angular.json` has no `fileReplacements`, so `environment.ts` is the only environment file
and whatever it contains is what ships. There used to be an `environment.prod.ts` reading
`import.meta.env.VITE_*`; nothing imported it and no `fileReplacements` entry ever swapped
it in, so the Netlify variables it named had no effect. Angular does not substitute
`import.meta.env` either, so wiring it up would have thrown at runtime rather than
working. Do not reintroduce that pattern without adding a build-time `define`.

Genuine secrets — the Resend API key, the reCAPTCHA *secret* key, notification recipients —
are never in the frontend. They live as Supabase Edge Function secrets (see below).

### Running locally

```bash
# Dev server with SSR + hydration (Angular's dev middleware renders and hydrates each request)
ng serve
# → http://localhost:4200
```

`server.ts` only exports handler functions (`netlifyAppEngineHandler`, `reqHandler`) for the Netlify Edge Function runtime — running `node dist/demo/server/server.mjs` directly does **not** start a listener; it just loads the module and exits. To verify SSR/hydration locally, use `ng serve` and check the browser console: in development mode Angular logs hydration diagnostics (e.g. `Angular hydrated N component(s) ... 0 component(s) were skipped`), which are stripped in production builds.

### Build

```bash
ng build              # Development build
ng build --configuration production  # Production build
```

Output in `dist/demo/`. Every route renders per request via SSR — the build produces no prerendered route HTML (`Prerendered 0 static routes`).

## Deployment

### Netlify

Push to the connected branch. The `@netlify/angular-runtime` plugin takes care of everything:

1. Recognizes `netlifyAppEngineHandler` in `server.ts`
2. Runs `ng build`
3. Deploys `dist/demo/server/server.mjs` as a Netlify Edge Function — it handles every page request (full SSR, no prerendering)
4. Static assets (JS/CSS bundles, images, `robots.txt`, `sitemap.xml`, `llms.txt`) are served from CDN

No environment variables need to be set in the Netlify dashboard. Everything the browser
bundle needs is committed in `src/environments/environment.ts`. Any `VITE_*` variables
still configured there are leftovers and are not read by the build.

### Supabase

Project `renegades-eu` (`ekmdcqcjvodsnaqpsgun`), region `eu-central-1` (Frankfurt).

```bash
supabase link --project-ref ekmdcqcjvodsnaqpsgun

# Deploy Edge Functions
supabase functions deploy send-contact-email
supabase functions deploy send-membership-application
supabase functions deploy send-tryout-email

# Set Edge Function secrets
supabase secrets set RESEND_API_KEY=your-resend-api-key
supabase secrets set NOTIFICATION_EMAILS=email1@example.com,email2@example.com
supabase secrets set RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### Keepalive

Supabase pauses a Free-plan project after roughly 7 days without *database* activity, and
a paused project stops resolving in DNS — which is what took all three forms down in
September 2026 with `FunctionsFetchError: Failed to send a request to the Edge Function`.
Because the site only uses Supabase to host Edge Functions, Postgres is otherwise never
touched and the inactivity clock never resets on its own.

`.github/workflows/supabase-keepalive.yml` reads one row from `public.heartbeat` daily to
supply that activity. It needs a `SUPABASE_ANON_KEY` repository secret, and it fails loudly
rather than silently if the project is paused or the key is rotated.

Database tables: `public.heartbeat` only, which exists solely for the keepalive above and
is read by nothing in the application. Team roster and sponsor data live in `src/assets/data/team-members.json` and `src/assets/data/sponsors.json`. Supabase is used only for Edge Functions handling transactional email: contact form, membership applications, and tryout requests.

Row Level Security: not applicable — no database reads/writes remain, only Edge Function invocations.

### reCAPTCHA

1. Create a reCAPTCHA v3 site at [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Add your domain(s) to the allowed list
3. Set `VITE_RECAPTCHA_SITE_KEY` (frontend) and `RECAPTCHA_SECRET_KEY` (Supabase Edge Function secret)

## Features

- Two teams: 1st team in the 1. DFFL, 2nd team in the Bayernliga
- Multilingual (DE at `/`, EN at `/en`) with per-locale canonical + hreflang; SSR-aware theme preference (`Sec-CH-Prefers-Color-Scheme`)
- Dark / Light mode
- FAQ page with `FAQPage` JSON-LD schema
- `llms.txt` for AI-agent discoverability
- GDPR-compliant cookie consent
- Fully responsive
- reCAPTCHA v3 on all forms
- Contact form with email notifications
- Club membership form
- Tryout request form
- Full server-side rendering (SSR) on every request for SEO and personalization
- Lazy-loaded routes

## License

MIT License — Copyright (c) 2025 Nürnberg Renegades e.V.
