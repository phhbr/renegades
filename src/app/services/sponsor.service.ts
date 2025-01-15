import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Sponsor {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  website?: string;
  active: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SponsorService {
  #supabaseClient = inject(SupabaseService).client;
  #sponsors = signal<Sponsor[]>([]);

  activeSponsors = computed(() => 
    this.#sponsors()
      .filter(sponsor => sponsor.active)
      .sort((a, b) => {
        // First sort by priority
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Then by creation date
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      })
  );

  async loadSponsors() {
    const { data, error } = await this.#supabaseClient
      .from('sponsors')
      .select('*');
    
    if (error) {
      console.error('Error loading sponsors:', error);
      return;
    }

    this.#sponsors.set(data);
  }
}