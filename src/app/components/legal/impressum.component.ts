
import { Component, OnInit, inject } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { MetaService } from '../../services/meta.service';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './impressum.component.html'
})
export class ImpressumComponent implements OnInit {
  private meta = inject(MetaService);

  ngOnInit(): void {
    this.meta.updateMeta({
      title: 'Impressum - Nürnberg Renegades e.V.',
      description: 'Legal information and impressum for Nürnberg Renegades e.V.',
      canonical: 'https://nuernberg-renegades.de/impressum'
    });
  }
}