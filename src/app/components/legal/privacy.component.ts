import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieSettingsComponent } from '../cookie-settings/cookie-settings.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, CookieSettingsComponent],
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent {}