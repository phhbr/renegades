import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  image_url?: string;
  number?: string;
  position?: string;
  member_type: 'staff' | 'player';
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  #supabaseClient = inject(SupabaseService).client;
  #teamMembers = signal<TeamMember[]>([]);

  staff = computed(() => 
    this.#teamMembers().filter(member => member.member_type === 'staff')
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  );

  players = computed(() => 
    this.#teamMembers().filter(member => member.member_type === 'player')
      .sort((a, b) => (a.number || '').localeCompare(b.number || ''))
  );

  async loadTeamMembers() {
    const { data, error } = await this.#supabaseClient
      .from('team_members')
      .select('*');
    
    if (error) {
      console.error('Error loading team members:', error);
      return;
    }

    this.#teamMembers.set(data);
  }
}