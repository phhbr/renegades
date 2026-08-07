import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocalePathPipe } from '../../pipes/locale-path.pipe';
import { MetaService } from '../../services/meta.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocalePathPipe],
  templateUrl: './not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent implements OnInit {
  #meta = inject(MetaService);

  /**
   * The artwork is optional: until `not-found.jpg` is added to src/assets/images and
   * `npm run optimize-images` has generated its variants, the illustration slot falls
   * back to the club emblem instead of showing a broken image.
   */
  readonly imageFailed = signal(false);

  readonly quickLinks = [
    { path: '/training', label: 'nav.training' },
    { path: '/team', label: 'nav.team' },
    { path: '/ergebnisse', label: 'nav.results' },
    { path: '/club', label: 'nav.club' },
    { path: '/faq', label: 'footer.faq' },
    { path: '/contact', label: 'nav.contact' },
  ];

  ngOnInit(): void {
    this.#meta.updateMeta({
      titleKey: 'meta.notfound.title',
      descriptionKey: 'meta.notfound.description',
      path: '/404',
      noindex: true,
      status: 404,
    });
  }
}
