import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes, RenderMode, ServerRoute } from '@angular/ssr';
import { appConfig } from './app.config';

const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'team', renderMode: RenderMode.Prerender },
  { path: 'sponsoring', renderMode: RenderMode.Prerender },
  { path: 'impressum', renderMode: RenderMode.Prerender },
  { path: 'datenschutz', renderMode: RenderMode.Prerender },
  // Form pages: Supabase creates WebSocket connections server-side that block prerender.
  // These pages are pure client-side forms with no SEO-critical content.
  { path: 'contact', renderMode: RenderMode.Client },
  { path: 'club', renderMode: RenderMode.Client },
  { path: 'training', renderMode: RenderMode.Client },
];

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
