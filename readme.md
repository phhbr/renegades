# Nürnberg Renegades e.V. Website

Official website for the Nürnberg Renegades Flag Football Club.

[![Deployment Status](https://api.netlify.com/api/v1/badges/7159a5d4-71cc-4595-b0e3-c312174ba716/deploy-status)](https://app.netlify.com/sites/renegades-relaunch/deploys)

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Angular 20 with SSR |
| Styling | TailwindCSS |
| Database & Auth | Supabase |
| Email | Resend (via Supabase Edge Functions) |
| Hosting | Netlify (Edge Functions + CDN) |
| Analytics | Umami |
| i18n | Angular i18n (DE / EN) |

## Architecture

### Rendering strategy

The app uses Angular SSR with a hybrid rendering approach configured in `src/app/app.config.server.ts`:

| Route | Mode | Reason |
| --- | --- | --- |
| `/` | Prerender | Static content, SEO-critical |
| `/team` | Prerender | Static content, SEO-critical |
| `/sponsoring` | Prerender | Static content, SEO-critical |
| `/impressum` | Prerender | Static content, legal |
| `/datenschutz` | Prerender | Static content, legal |
| `/contact` | Client | Form page; Supabase creates WebSocket connections server-side that block prerendering |
| `/club` | Client | Form page; same reason |
| `/training` | Client | Form page; same reason |

Prerendered pages are built to static HTML at `ng build` time and served directly from the Netlify CDN — no function invoked per request. Client-rendered pages are served as a CSR shell and hydrated in the browser.

### Build output

```text
dist/demo/
├── browser/          # Static assets + prerendered HTML (served from CDN)
│   ├── index.html         # CSR shell (for /contact, /club, /training)
│   ├── team/index.html    # Prerendered
│   ├── sponsoring/index.html
│   ├── impressum/index.html
│   ├── datenschutz/index.html
│   └── *.js / *.css       # Hashed asset bundles
└── server/           # SSR server bundle (deployed as Netlify Edge Function)
    ├── server.mjs         # Entry point — handles non-prerendered requests
    └── main.server.mjs    # Angular server bootstrap
```

### Request flow on Netlify

```text
Browser request
    │
    ├── /team, /sponsoring, /impressum, /datenschutz, /
    │       └── Netlify CDN → prerendered index.html (instant, no cold start)
    │
    ├── /contact, /club, /training
    │       └── Netlify Edge Function (server.mjs) → CSR shell → browser hydrates
    │
    └── Static assets (*.js, *.css, images)
            └── Netlify CDN
```

### Key SSR files

| File | Purpose |
| --- | --- |
| `server.ts` | Express server for local dev + `netlifyAppEngineHandler` export for Netlify |
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
│   │   │   ├── footer/
│   │   │   ├── home/
│   │   │   ├── language-switcher/
│   │   │   ├── legal/             # Impressum + Datenschutz
│   │   │   ├── navbar/
│   │   │   ├── responsive-image/
│   │   │   ├── sponsoring/
│   │   │   ├── team/
│   │   │   └── training/          # Training info + tryout form
│   │   ├── services/
│   │   │   ├── analytics.service.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── cookie-consent.service.ts
│   │   │   ├── language.service.ts
│   │   │   ├── membership.service.ts
│   │   │   ├── meta.service.ts
│   │   │   ├── recaptcha.service.ts
│   │   │   ├── sponsor.service.ts
│   │   │   ├── storage.service.ts    # localStorage wrapper (SSR-safe)
│   │   │   ├── supabase.service.ts
│   │   │   ├── team.service.ts
│   │   │   └── tryout.service.ts
│   │   ├── i18n/                  # Translation files (DE/EN)
│   │   ├── pipes/
│   │   ├── app.component.ts
│   │   ├── app.config.ts          # Shared providers
│   │   ├── app.config.server.ts   # Server providers + render modes
│   │   └── app.routes.ts
│   ├── assets/images/
│   ├── environments/
│   │   ├── environment.ts         # Dev (uses .env values)
│   │   └── environment.prod.ts    # Production
│   └── global_styles.css
├── supabase/
│   ├── functions/
│   │   ├── send-contact-email/    # Contact form → Resend
│   │   └── send-tryout-email/     # Tryout request → Resend
│   └── migrations/
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

Create a `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

### Running locally

```bash
# Live-reload dev server (no SSR, fastest iteration)
ng serve

# Production SSR server (to verify server-rendering locally)
ng build
NG_ALLOWED_HOSTS=localhost node dist/demo/server/server.mjs
# → http://localhost:4000
```

`NG_ALLOWED_HOSTS` is required locally — Angular's SSRF protection blocks `localhost` by default. This variable is not needed on Netlify.

### Build

```bash
ng build              # Development build
ng build --configuration production  # Production build
```

Output in `dist/demo/`. The build prerendering step renders 5 static routes to HTML.

## Deployment

### Netlify

Push to the connected branch. The `@netlify/angular-runtime` plugin takes care of everything:

1. Recognizes `netlifyAppEngineHandler` in `server.ts`
2. Runs `ng build` — prerendered HTML goes to `dist/demo/browser/`
3. Deploys `dist/demo/server/server.mjs` as a Netlify Edge Function
4. Pre-rendered pages are served from CDN; dynamic requests go through the edge function

Set these environment variables in the Netlify dashboard:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RECAPTCHA_SITE_KEY
```

### Supabase

```bash
supabase link --project-ref your-project-ref
supabase db push

# Deploy Edge Functions
supabase functions deploy send-contact-email
supabase functions deploy send-tryout-email

# Set Edge Function secrets
supabase secrets set RESEND_API_KEY=your-resend-api-key
supabase secrets set NOTIFICATION_EMAILS=email1@example.com,email2@example.com
supabase secrets set RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

Database tables: `team_members`, `sponsors`, `press_coverage`

Row Level Security: public read for team members and active sponsors; admin-only write; public contact form submissions.

### reCAPTCHA

1. Create a reCAPTCHA v3 site at [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Add your domain(s) to the allowed list
3. Set `VITE_RECAPTCHA_SITE_KEY` (frontend) and `RECAPTCHA_SECRET_KEY` (Supabase Edge Function secret)

## Features

- Multilingual (DE/EN)
- Dark / Light mode
- GDPR-compliant cookie consent
- Fully responsive
- reCAPTCHA v3 on all forms
- Contact form with email notifications
- Club membership form
- Tryout request form
- Server-side rendering with prerendering for SEO
- Lazy-loaded routes

## License

MIT License — Copyright (c) 2025 Nürnberg Renegades e.V.
