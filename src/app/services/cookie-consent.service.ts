import { Injectable, signal } from '@angular/core';

export interface CookieConsent {
  necessary: boolean; // Always true, required cookies
  preferences: boolean; // For language, theme, etc.
  maps: boolean; // For Google Maps integration
  analytics: boolean; // For Umami analytics
}

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  readonly #COOKIE_CONSENT_KEY = 'cookie-consent';
  readonly #consent = signal<CookieConsent | null>(null);

  constructor() {
    this.loadConsent();
  }

  private loadConsent() {
    const savedConsent = localStorage.getItem(this.#COOKIE_CONSENT_KEY);
    if (savedConsent) {
      this.#consent.set(JSON.parse(savedConsent));
    }
  }

  updateConsent(consent: CookieConsent) {
    localStorage.setItem(this.#COOKIE_CONSENT_KEY, JSON.stringify(consent));
    this.#consent.set(consent);
  }

  hasConsent(): boolean {
    return this.#consent() !== null;
  }

  getConsent(): CookieConsent | null {
    return this.#consent();
  }

  acceptAll() {
    this.updateConsent({
      necessary: true,
      preferences: true,
      maps: true,
      analytics: true
    });
  }

  acceptNecessaryOnly() {
    this.updateConsent({
      necessary: true,
      preferences: false,
      maps: false,
      analytics: false
    });
  }
}