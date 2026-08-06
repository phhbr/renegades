import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CookieConsentService } from '../../services/cookie-consent.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterModule } from '@angular/router';
import { LocalePathPipe } from '../../pipes/locale-path.pipe';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [TranslatePipe, RouterModule, LocalePathPipe],
  templateUrl: './cookie-consent.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieConsentComponent {
  showBanner = signal(false);
  #cookieConsentService = inject(CookieConsentService);

  constructor() {
    afterNextRender(() => {
      this.showBanner.set(!this.#cookieConsentService.hasConsent());
    });
  }

  acceptAll() {
    this.#cookieConsentService.acceptAll();
    this.showBanner.set(false);
  }

  acceptNecessaryOnly() {
    this.#cookieConsentService.acceptNecessaryOnly();
    this.showBanner.set(false);
  }
}
