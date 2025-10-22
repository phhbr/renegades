import { Component } from '@angular/core';

import { TryoutFormComponent } from './tryout-form.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [TryoutFormComponent, TranslatePipe],
  templateUrl: './training.component.html'
})
export class TrainingComponent {
  constructor(private cookieConsentService: CookieConsentService) {}

  showMap(): boolean {
    const consent = this.cookieConsentService.getConsent();
    return consent?.maps ?? false;
  }

  acceptCookies() {
    this.cookieConsentService.acceptAll();
  }
}