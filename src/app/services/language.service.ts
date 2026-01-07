import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = signal<string>('en');
  #localStorage = inject(StorageService);

  constructor() {
    // Check browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith('de')) {
      this.setLanguage('de');
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