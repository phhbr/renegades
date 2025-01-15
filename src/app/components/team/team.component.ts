import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './team.component.html'
})
export class TeamComponent implements OnInit {
  #teamService = inject(TeamService);
  staff = this.#teamService.staff;
  players = this.#teamService.players;

  async ngOnInit() {
    await this.#teamService.loadTeamMembers();
  }
}