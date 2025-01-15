import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SponsorService } from '../../services/sponsor.service';

@Component({
  selector: 'app-sponsoring',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './sponsoring.component.html'
})
export class SponsoringComponent implements OnInit {
  #sponsorService = inject(SponsorService);
  sponsors = this.#sponsorService.activeSponsors;

  async ngOnInit() {
    await this.#sponsorService.loadSponsors();
  }
}