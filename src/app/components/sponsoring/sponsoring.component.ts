import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MetaService } from '../../services/meta.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SponsorService } from '../../services/sponsor.service';
import { RouterModule } from '@angular/router';
import { LocalePathPipe } from '../../pipes/locale-path.pipe';

@Component({
  selector: 'app-sponsoring',
  standalone: true,
  imports: [RouterModule, TranslatePipe, LocalePathPipe],
  templateUrl: './sponsoring.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsoringComponent implements OnInit {
  #sponsorService = inject(SponsorService);
  sponsors = this.#sponsorService.activeSponsors;
  #meta = inject(MetaService);

  async ngOnInit() {
    this.#meta.updateMeta({
      titleKey: 'meta.sponsoring.title',
      descriptionKey: 'meta.sponsoring.description',
      path: '/sponsoring'
    });

    await this.#sponsorService.loadSponsors();
  }
}