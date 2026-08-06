import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { localizePath } from '../i18n/locale';

/**
 * Maps a language-neutral route path onto the active locale, so `routerLink` keeps
 * visitors inside their language: '/team' renders as '/team' in German and '/en/team'
 * in English. Impure like TranslatePipe — the active language is not an input.
 */
@Pipe({
  name: 'localePath',
  standalone: true,
  pure: false
})
export class LocalePathPipe implements PipeTransform {
  #languageService = inject(LanguageService);

  transform(path: string): string {
    return localizePath(path, this.#languageService.getCurrentLang());
  }
}
