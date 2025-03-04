import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CookieConsentService } from './cookie-consent.service';

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  #router = inject(Router);
  #cookieConsentService = inject(CookieConsentService);

  constructor() {
    // Track page views
    this.#router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.#trackPageView((event as NavigationEnd).urlAfterRedirects);
    });
  }

  /** Check if analytics tracking is allowed */
  #isTrackingAllowed(): boolean {
    const consent = this.#cookieConsentService.getConsent();
    return !!consent?.analytics;
  }

  /** Track page views */
  #trackPageView(url: string): void {
    if (typeof window !== 'undefined' && window.umami && this.#isTrackingAllowed()) {
      // Umami automatically tracks page views, but we can manually track them too
      window.umami.track('pageview', { url });
    }
  }

  /** Track a custom event */
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    if (typeof window !== 'undefined' && window.umami && this.#isTrackingAllowed()) {
      window.umami.track(eventName, eventData);
    }
  }
}