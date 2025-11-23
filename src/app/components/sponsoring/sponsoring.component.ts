import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MetaService } from '../../services/meta.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SponsorService } from '../../services/sponsor.service';
import { RouterModule } from '@angular/router';
import { ResponsiveImageComponent } from '../responsive-image/responsive-image.component';

@Component({
  selector: 'app-sponsoring',
  standalone: true,
  imports: [RouterModule, TranslatePipe, ResponsiveImageComponent],
  templateUrl: './sponsoring.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsoringComponent implements OnInit {
  #sponsorService = inject(SponsorService);
  sponsors = this.#sponsorService.activeSponsors;
  #meta = inject(MetaService);

  async ngOnInit() {
    this.#meta.updateMeta({
      title: 'Sponsor Nürnberg Renegades - Support Flag Football',
      description: 'Become a sponsor of Nürnberg Renegades e.V. Support competitive flag football in Germany and reach our community.',
      canonical: 'https://nuernberg-renegades.de/sponsoring'
    });

    await this.#sponsorService.loadSponsors();
  }
}