import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = signal<string>('en');
  #localStorage = inject(StorageService);
  #platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      const browserLang = navigator.language;
      if (browserLang.startsWith('de')) {
        this.setLanguage('de');
      }
    }
  }

  setLanguage(lang: string) {
    this.currentLang.set(lang);
    this.#localStorage.setItem('preferredLanguage', lang);
  }

  getCurrentLang(): string {
    return this.currentLang();
  }
}
