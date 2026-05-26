import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private platformId = inject(PLATFORM_ID);
  private _client: SupabaseClient | null = null;

  get client(): SupabaseClient {
    if (!this._client) {
      if (!isPlatformBrowser(this.platformId)) {
        throw new Error('Supabase client is not available during server-side rendering');
      }
      if (!environment.supabase.url || !environment.supabase.key) {
        throw new Error('Missing Supabase configuration. Please check your environment variables.');
      }
      this._client = createClient(environment.supabase.url, environment.supabase.key);
    }
    return this._client;
  }
}