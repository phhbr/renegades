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
│   │   └── send-contact-email/
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

- **Backend:**
  - Supabase (Database & Authentication)
  - Edge Functions (Contact form)
  - Row Level Security (RLS)

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
   ```

4. Configure Edge Function environment variables:
   ```bash
   supabase secrets set RESEND_API_KEY=your-resend-api-key
   supabase secrets set NOTIFICATION_EMAILS=email1@example.com,email2@example.com
   ```

5. Enable Row Level Security (RLS) policies:
   - Public read access for team members and active sponsors
   - Admin-only write access
   - Public contact form submissions
   - Admin-only access to contact messages

### Database Schema

#### Tables:
- `team_members`: Staff and player information
- `sponsors`: Club sponsors and partners
- `contact_messages`: Contact form submissions

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Features

- 🌍 Multilingual (DE/EN)
- 🌓 Dark/Light mode
- 🍪 GDPR-compliant cookie consent
- 📱 Fully responsive design
- 🗺️ Google Maps integration
- 📧 Contact form with email notifications
- 🔒 Row Level Security
- 🏃 Performance optimized
- 📦 Lazy-loaded routes

## License

This project is proprietary and confidential. All rights reserved by Nürnberg Renegades e.V.