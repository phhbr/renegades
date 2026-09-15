/**
 * This is the only environment file: angular.json has no `fileReplacements`, so whatever
 * is here ships to production. The Supabase URL and anon key are public by design — they
 * are readable in the browser bundle either way — and reCAPTCHA's site key likewise, so
 * they are committed rather than injected at build time.
 *
 * There used to be an environment.prod.ts reading `import.meta.env.VITE_*`. Nothing ever
 * imported it and no fileReplacements entry ever swapped it in, so the Netlify variables
 * it named had no effect. Angular does not substitute `import.meta.env` either, so had it
 * been wired up it would have thrown at runtime rather than working.
 */
export const environment = {
  production: false,
  supabase: {
    url: 'https://ekmdcqcjvodsnaqpsgun.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbWRjcWNqdm9kc25hcXBzZ3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NjQ5MTUsImV4cCI6MjEwNTA0MDkxNX0.gXkhDGSXg_00qkUW2jKTmSNLhUftqsdtariRWhY_uRU' },
  recaptcha: {
    siteKey: '6LfTgr8qAAAAAB6vUF6Y8w5DZSuINMy1uYMYa0TB'
  },
  analytics: {
    umamiUrl: 'https://cloud.umami.is/script.js',
    websiteId: 'de2a7426-55c6-457d-b663-7e12bce985e9'
  }
};