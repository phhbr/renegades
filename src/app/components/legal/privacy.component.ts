import { Component, OnInit, inject } from '@angular/core';
import { MetaService } from '../../services/meta.service';
import { CookieSettingsComponent } from '../cookie-settings/cookie-settings.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CookieSettingsComponent],
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent implements OnInit {
  private meta = inject(MetaService);

  ngOnInit(): void {
    this.meta.updateMeta({
      titleKey: 'meta.privacy.title',
      descriptionKey: 'meta.privacy.description',
      path: '/datenschutz'
    });
  }
}