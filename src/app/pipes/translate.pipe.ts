import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { translations } from '../i18n/translations';

type TranslationsType = typeof translations;
type LanguageCode = keyof TranslationsType;

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  #languageService = inject(LanguageService);

  transform(key: string, replacements?: Record<string, string>): string {
    const currentLang = this.#languageService.getCurrentLang() as LanguageCode;
    
    try {
      let translatedText = (translations[currentLang] as any)?.[key];
      if (!translatedText) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }

      // Replace placeholders if replacements are provided
      if (replacements) {
        Object.entries(replacements).forEach(([key, value]) => {
          translatedText = translatedText.replace(`{{ ${key} }}`, value);
        });
      }

      return translatedText;
    } catch (error) {
      console.warn(`Error accessing translation for key: ${key}`, error);
      return key;
    }
  }
}