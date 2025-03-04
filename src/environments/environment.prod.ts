export const environment = {
  production: true,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
  },
  recaptcha: {
    siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ''
  },
  analytics: {
    umamiUrl: import.meta.env.VITE_UMAMI_URL ?? '',
    websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID ?? ''
  }
};