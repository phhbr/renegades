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
      title: 'Datenschutz | Nürnberg Renegades e.V.',
      description: 'Datenschutzhinweise und Informationen zum Umgang mit personenbezogenen Daten bei Nürnberg Renegades e.V.',
      canonical: 'https://nuernberg-renegades.de/datenschutz'
    });
  }
}