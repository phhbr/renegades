import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { TeamService } from '../../services/team.service';
import { MetaService } from '../../services/meta.service';
import { ResponsiveImageComponent } from '../responsive-image/responsive-image.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [TranslatePipe, ResponsiveImageComponent],
  templateUrl: './team.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent implements OnInit {
  #teamService = inject(TeamService);
  #meta = inject(MetaService);
  staff = this.#teamService.staff;
  players = this.#teamService.players;
  error = signal<string | null>(null);
  loading = signal(true);

  // Extract image ID from asset path (e.g., "/assets/images/players/11.jpg" -> "11")
  getImageId(url: string | null | undefined): string | null {
    if (!url) return null;
    const match = url.match(/players\/(\d+)/);
    return match ? match[1] : null;
  }

  async ngOnInit() {
    // Update team page metadata
    this.#meta.updateMeta({
      title: 'Meet the Nürnberg Renegades - Team & Players',
      description: 'Meet the talented flag football players and staff of Nürnberg Renegades e.V. Competing in the DFFL First Division.',
      canonical: 'https://nuernberg-renegades.de/team',
      image: 'https://nuernberg-renegades.de/assets/images/team-huddle.jpg',
      imageAlt: 'Nürnberg Renegades team huddle'
    });
    try {
      await this.#teamService.loadTeamMembers();
    } catch (err) {
      console.error('Error loading team members:', err);
      this.error.set('Error loading team members. Please try again later.');
    } finally {
      this.loading.set(false);
    }
  }
}