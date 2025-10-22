import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { CookieConsentService } from '../../services/cookie-consent.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [TranslatePipe, RouterModule],
  templateUrl: './cookie-consent.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieConsentComponent {
  showBanner = signal(true);

  constructor(private cookieConsentService: CookieConsentService) {
    this.showBanner.set(!this.cookieConsentService.hasConsent());
  }

  acceptAll() {
    this.cookieConsentService.acceptAll();
    this.showBanner.set(false);
  }

  acceptNecessaryOnly() {
    this.cookieConsentService.acceptNecessaryOnly();
    this.showBanner.set(false);
  }
}