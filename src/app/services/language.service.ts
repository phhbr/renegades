import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = new BehaviorSubject<string>('en');
  currentLang$ = this.currentLang.asObservable();

  constructor() {
    // Check browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith('de')) {
      this.setLanguage('de');
    }
  }

  setLanguage(lang: string) {
    this.currentLang.next(lang);
    localStorage.setItem('preferredLanguage', lang);
  }

  getCurrentLang(): string {
    return this.currentLang.value;
  }
}