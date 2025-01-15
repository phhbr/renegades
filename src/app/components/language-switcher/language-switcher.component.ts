import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html'
})
export class LanguageSwitcherComponent {
  constructor(private languageService: LanguageService) {}

  toggleLanguage() {
    const currentLang = this.languageService.getCurrentLang();
    this.languageService.setLanguage(currentLang === 'en' ? 'de' : 'en');
  }

  getCurrentLang(): string {
    return this.languageService.getCurrentLang();
  }
}