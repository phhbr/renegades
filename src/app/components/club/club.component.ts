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
      title: 'About Nürnberg Renegades - Club & Membership',
      description: 'Learn about Nürnberg Renegades e.V., membership, community activities and how to join our flag football club.',
      canonical: 'https://nuernberg-renegades.de/club'
    });
  }
}