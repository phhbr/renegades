import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes, RenderMode, ServerRoute } from '@angular/ssr';
import { appConfig } from './app.config';

const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'team', renderMode: RenderMode.Prerender },
  { path: 'sponsoring', renderMode: RenderMode.Prerender },
  { path: 'impressum', renderMode: RenderMode.Prerender },
  { path: 'datenschutz', renderMode: RenderMode.Prerender },
  { path: 'ergebnisse', renderMode: RenderMode.Client },
  { path: 'ergebnisse/:team', renderMode: RenderMode.Client },
  { path: 'ergebnisse/:team/:tab', renderMode: RenderMode.Client },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'club', renderMode: RenderMode.Prerender },
  { path: 'training', renderMode: RenderMode.Prerender },
];

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
