import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [],
  templateUrl: './language-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  #languageService = inject(LanguageService);
  displayedLanguage = computed(() => this.#languageService.getCurrentLang() === 'en' ? 'DE' : 'EN');


  toggleLanguage() {
    const currentLang = this.#languageService.getCurrentLang();
    this.#languageService.setLanguage(currentLang === 'en' ? 'de' : 'en');
  }
}