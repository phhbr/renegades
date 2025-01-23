# Nürnberg Renegades e.V. Website

Official website for the Nürnberg Renegades Flag Football Club, built with Angular and Supabase.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── components/         # UI components
│   │   │   ├── contact/       # Contact form
│   │   │   ├── cookie-consent/ # Cookie consent banner
│   │   │   ├── footer/        # Site footer
│   │   │   ├── home/         # Home page
│   │   │   ├── legal/        # Legal pages (Impressum, Privacy)
│   │   │   ├── navbar/       # Navigation bar
│   │   │   ├── sponsoring/   # Sponsors page
│   │   │   ├── team/         # Team roster
│   │   │   └── training/     # Training information
│   │   │   │   └── tryout-form/  # Tryout request form
│   │   ├── i18n/             # Translations (DE/EN)
│   │   ├── pipes/            # Angular pipes
│   │   ├── services/         # Business logic & API calls
│   │   ├── app.component.ts  # Root component
│   │   └── app.routes.ts     # Route definitions
│   ├── assets/               # Static assets
│   │   └── images/          # Image files
│   ├── environments/         # Environment configurations
│   └── global_styles.css    # Global styles
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── _shared/        # Shared utilities
│   │   ├── send-contact-email/
│   │   └── send-tryout-email/
│   └── migrations/         # Database migrations
└── tailwind.config.js      # Tailwind CSS configuration
```

## Technology Stack

- **Frontend:**
  - Angular 19
  - TailwindCSS
  - i18n (English/German)
  - Dark mode support
  - Cookie consent management
  - Responsive design
  - reCAPTCHA v3 protection
  - Tryout Request Form

- **Backend:**
  - Supabase (Database & Authentication)
  - Edge Functions (Contact form)
  - Edge Functions (Tryout request emails)
  - Row Level Security (RLS)
  - reCAPTCHA verification

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Configure build settings:
   ```
   Build command: ng build
   Publish directory: dist/demo/browser
   ```

3. Set environment variables:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
   ```

4. Deploy! Netlify will automatically build and deploy your site.

### Supabase Setup

1. Create a new Supabase project

2. Run migrations:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

3. Set up Edge Functions:
   ```bash
   # Deploy contact form function
   supabase functions deploy send-contact-email
   # Deploy tryout request function
   supabase functions deploy send-tryout-email
   ```

4. Configure Edge Function environment variables:
   ```bash
   supabase secrets set RESEND_API_KEY=your-resend-api-key
   supabase secrets set NOTIFICATION_EMAILS=email1@example.com,email2@example.com
   supabase secrets set RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
   ```

5. Enable Row Level Security (RLS) policies:
   - Public read access for team members and active sponsors
   - Admin-only write access
   - Public contact form submissions
   - Admin-only access to contact messages

### reCAPTCHA Setup

1. Create a new reCAPTCHA v3 site at [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Add your domain(s) to the allowed domains list
3. Configure environment variables:
   - Frontend: `VITE_RECAPTCHA_SITE_KEY`
   - Backend: `RECAPTCHA_SECRET_KEY` (Supabase Edge Functions)

### Database Schema
#### Tables:
- `team_members`: Staff and player information
- `sponsors`: Club sponsors and partners (includes priority field for controlling display order)
- `press_coverage`: News and media coverage

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Features

- 🌍 Multilingual (DE/EN)
- 🌓 Dark/Light mode
- 🍪 GDPR-compliant cookie consent
- 📱 Fully responsive design
- 🗺️ Google Maps integration
- 🏈 Tryout Request Form with email notifications
- 🔒 Row Level Security
- 🤖 reCAPTCHA v3 protection
- 🏃 Performance optimized
- 📦 Lazy-loaded routes

## License

MIT License
Copyright (c) 2025 Nürnberg Renegades e.V.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.