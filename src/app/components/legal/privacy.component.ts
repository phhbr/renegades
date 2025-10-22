import { Component } from '@angular/core';

import { CookieSettingsComponent } from '../cookie-settings/cookie-settings.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CookieSettingsComponent],
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent {}