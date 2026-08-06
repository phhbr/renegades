import { Component, OnInit, inject } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { MembershipFormComponent } from './membership-form.component';
import { MetaService } from '../../services/meta.service';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [TranslatePipe, MembershipFormComponent],
  templateUrl: './club.component.html'
})
export class ClubComponent implements OnInit {
  private meta = inject(MetaService);

  ngOnInit(): void {
    this.meta.updateMeta({
      title: 'Club & Mitgliedschaft | Nürnberg Renegades',
      description: 'Erfahre mehr über Nürnberg Renegades e.V., unsere Mitgliedschaft, Community und den Einstieg ins Flag Football.',
      canonical: 'https://nuernberg-renegades.de/club'
    });
  }
}