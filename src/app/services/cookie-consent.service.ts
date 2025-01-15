import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CookieConsent {
  necessary: boolean; // Always true, required cookies
  preferences: boolean; // For language, theme, etc.
  maps: boolean; // For Google Maps integration
}

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  private readonly COOKIE_CONSENT_KEY = 'cookie-consent';
  private consentSubject = new BehaviorSubject<CookieConsent | null>(null);
  consent$ = this.consentSubject.asObservable();

  constructor() {
    this.loadConsent();
  }

  private loadConsent() {
    const savedConsent = localStorage.getItem(this.COOKIE_CONSENT_KEY);
    if (savedConsent) {
      this.consentSubject.next(JSON.parse(savedConsent));
    }
  }

  updateConsent(consent: CookieConsent) {
    localStorage.setItem(this.COOKIE_CONSENT_KEY, JSON.stringify(consent));
    this.consentSubject.next(consent);
  }

  hasConsent(): boolean {
    return this.consentSubject.value !== null;
  }

  getConsent(): CookieConsent | null {
    return this.consentSubject.value;
  }

  acceptAll() {
    this.updateConsent({
      necessary: true,
      preferences: true,
      maps: true
    });
  }

  acceptNecessaryOnly() {
    this.updateConsent({
      necessary: true,
      preferences: false,
      maps: false
    });
  }
}