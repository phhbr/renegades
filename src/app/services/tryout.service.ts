import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface TryoutRequest {
  name: string;
  email: string;
  phone: string;
  age: string;
  experience: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TryoutService {
  #supabaseClient = inject(SupabaseService).client;

  async submitTryoutForm(message: TryoutRequest) {
    const { error: functionError } = await this.#supabaseClient.functions.invoke('send-tryout-email', {
      body: { request: message }
    });

    if (functionError) {
      console.error('Error sending tryout email:', functionError);
      throw functionError;
    }

    return message;
  }
}