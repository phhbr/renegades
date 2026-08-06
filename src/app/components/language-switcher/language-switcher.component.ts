import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { localizePath } from '../../i18n/locale';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [],
  templateUrl: './language-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  #languageService = inject(LanguageService);
  #router = inject(Router);

  displayedLanguage = computed(() => this.#languageService.getCurrentLang() === 'en' ? 'DE' : 'EN');

  /**
   * Switching language is a navigation, not a state toggle: each language has its own URL,
   * so the visitor lands on the same page in the other language and can share that link.
   */
  toggleLanguage() {
    const target = this.#languageService.getCurrentLang() === 'en' ? 'de' : 'en';
    const tree = this.#router.parseUrl(this.#router.url);
    const path = localizePath(this.#router.url.split(/[?#]/)[0], target);
    this.#router.navigate([path], {
      queryParams: tree.queryParams,
      fragment: tree.fragment ?? undefined,
    });
  }
}
