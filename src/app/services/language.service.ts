import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // German-first site: default to 'de' unless a saved preference or explicit English signal says otherwise.
  private readonly currentLangSignal = signal<string>('de');
  readonly currentLang = this.currentLangSignal.asReadonly();
  #localStorage = inject(StorageService);
  #platformId = inject(PLATFORM_ID);

  constructor() {
    // Explicit ?lang= query param (e.g. from hreflang links Google follows) takes priority over any saved preference.
    const queryLang = this.#localStorage.getQueryParam('lang');
    if (queryLang === 'de' || queryLang === 'en') {
      this.setLanguage(queryLang);
      return;
    }

    const savedLanguage = this.#localStorage.getCookie('preferredLanguage') ?? this.#localStorage.getItem('preferredLanguage');
    if (savedLanguage === 'de' || savedLanguage === 'en') {
      this.currentLangSignal.set(savedLanguage);
      return;
    }

    const acceptLanguage = this.#localStorage.getRequestHeader('accept-language');
    if (acceptLanguage && /(^|[,;\s])en(-|[,;\s]|$)/i.test(acceptLanguage) && !/(^|[,;\s])de(-|[,;\s]|$)/i.test(acceptLanguage)) {
      this.currentLangSignal.set('en');
      return;
    }

    if (isPlatformBrowser(this.#platformId)) {
      const browserLang = navigator.language;
      if (browserLang.startsWith('en') && !browserLang.startsWith('de')) {
        this.currentLangSignal.set('en');
      }
    }
  }

  setLanguage(lang: string) {
    this.currentLangSignal.set(lang);
    this.#localStorage.setItem('preferredLanguage', lang);
    this.#localStorage.setCookie('preferredLanguage', lang);
  }

  getCurrentLang(): string {
    return this.currentLangSignal();
  }
}
