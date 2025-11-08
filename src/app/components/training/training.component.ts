import { Component, computed, signal } from '@angular/core';

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
  private currentMonth = signal(new Date().getMonth() + 1); // 1-12

  isOffSeason = computed(() => {
    // Off-season is November (11) through March (3)
    const month = this.currentMonth();
    return month >= 11 || month <= 3;
  });

  constructor(private cookieConsentService: CookieConsentService) {}

  showMap(): boolean {
    const consent = this.cookieConsentService.getConsent();
    return consent?.maps ?? false;
  }

  acceptCookies() {
    this.cookieConsentService.acceptAll();
  }
}