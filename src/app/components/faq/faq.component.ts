import { Component, OnDestroy, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MetaService } from '../../services/meta.service';
import { LanguageService } from '../../services/language.service';
import { translations } from '../../i18n/translations';

interface FaqItem {
  questionKey: string;
  answerKey: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './faq.component.html'
})
export class FaqComponent implements OnDestroy {
  private meta = inject(MetaService);
  private languageService = inject(LanguageService);

  private readonly jsonLdId = 'faq-schema';

  readonly items: FaqItem[] = [
    { questionKey: 'faq.q1.question', answerKey: 'faq.q1.answer' },
    { questionKey: 'faq.q2.question', answerKey: 'faq.q2.answer' },
    { questionKey: 'faq.q3.question', answerKey: 'faq.q3.answer' },
    { questionKey: 'faq.q4.question', answerKey: 'faq.q4.answer' },
    { questionKey: 'faq.q5.question', answerKey: 'faq.q5.answer' },
    { questionKey: 'faq.q6.question', answerKey: 'faq.q6.answer' },
    { questionKey: 'faq.q7.question', answerKey: 'faq.q7.answer' },
    { questionKey: 'faq.q8.question', answerKey: 'faq.q8.answer' },
  ];

  constructor() {
    this.meta.updateMeta({
      title: 'FAQ – Häufige Fragen | Nürnberg Renegades',
      description: 'Antworten auf häufige Fragen zu Nürnberg Renegades e.V.: Mitgliedschaft, Kosten, Training und unsere Teams in der 1. DFFL und der Bayernliga.',
      canonical: 'https://nuernberg-renegades.de/faq'
    });

    // Rebuild the FAQPage schema whenever the active language changes.
    effect(() => {
      this.languageService.currentLang();
      this.updateJsonLd();
    });
  }

  ngOnDestroy(): void {
    this.meta.removeJsonLd(this.jsonLdId);
  }

  private updateJsonLd(): void {
    const lang = this.languageService.getCurrentLang() as keyof typeof translations;
    const dict = (translations[lang] ?? translations.en) as Record<string, string>;

    this.meta.setJsonLd(this.jsonLdId, {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.items.map(item => ({
        '@type': 'Question',
        name: dict[item.questionKey],
        acceptedAnswer: {
          '@type': 'Answer',
          text: dict[item.answerKey]
        }
      }))
    });
  }
}
