import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './team.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent implements OnInit {
  #teamService = inject(TeamService);
  staff = this.#teamService.staff;
  players = this.#teamService.players;
  error = signal<string | null>(null);
  loading = signal(true);

  async ngOnInit() {
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