import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly currentLangSignal = signal<string>('en');
  readonly currentLang = this.currentLangSignal.asReadonly();
  #localStorage = inject(StorageService);
  #platformId = inject(PLATFORM_ID);

  constructor() {
    const savedLanguage = this.#localStorage.getCookie('preferredLanguage') ?? this.#localStorage.getItem('preferredLanguage');
    if (savedLanguage === 'de' || savedLanguage === 'en') {
      this.currentLangSignal.set(savedLanguage);
      return;
    }

    const acceptLanguage = this.#localStorage.getRequestHeader('accept-language');
    if (acceptLanguage && /(^|[,;\s])de(-|[,;\s]|$)/i.test(acceptLanguage)) {
      this.currentLangSignal.set('de');
      return;
    }

    if (isPlatformBrowser(this.#platformId)) {
      const browserLang = navigator.language;
      if (browserLang.startsWith('de')) {
        this.currentLangSignal.set('de');
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
