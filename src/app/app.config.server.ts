import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes, RenderMode, ServerRoute } from '@angular/ssr';
import { appConfig } from './app.config';

const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'team', renderMode: RenderMode.Server },
  { path: 'sponsoring', renderMode: RenderMode.Server },
  { path: 'impressum', renderMode: RenderMode.Server },
  { path: 'datenschutz', renderMode: RenderMode.Server },
  { path: 'ergebnisse', renderMode: RenderMode.Server },
  { path: 'ergebnisse/:team', renderMode: RenderMode.Server },
  { path: 'ergebnisse/:team/:tab', renderMode: RenderMode.Server },
  { path: 'contact', renderMode: RenderMode.Server },
  { path: 'faq', renderMode: RenderMode.Server },
  { path: 'club', renderMode: RenderMode.Server },
  { path: 'training', renderMode: RenderMode.Server },
];

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
