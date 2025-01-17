import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = signal<string>('en');

  constructor() {
    // Check browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith('de')) {
      this.setLanguage('de');
    }
  }

  setLanguage(lang: string) {
    this.currentLang.set(lang);
    localStorage.setItem('preferredLanguage', lang);
  }

  getCurrentLang(): string {
    return this.currentLang();
  }
}