import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MetaService } from '../../services/meta.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SponsorService } from '../../services/sponsor.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sponsoring',
  standalone: true,
  imports: [RouterModule, TranslatePipe],
  templateUrl: './sponsoring.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsoringComponent implements OnInit {
  #sponsorService = inject(SponsorService);
  sponsors = this.#sponsorService.activeSponsors;
  #meta = inject(MetaService);

  async ngOnInit() {
    this.#meta.updateMeta({
      title: 'Sponsoring | Nürnberg Renegades',
      description: 'Support Nürnberg Renegades e.V. as a sponsor and help grow competitive flag football in Nürnberg and beyond.',
      canonical: 'https://nuernberg-renegades.de/sponsoring'
    });

    await this.#sponsorService.loadSponsors();
  }
}