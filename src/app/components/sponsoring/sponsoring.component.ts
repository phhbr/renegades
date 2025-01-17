import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
  async ngOnInit() {
    await this.#sponsorService.loadSponsors();
  }
}