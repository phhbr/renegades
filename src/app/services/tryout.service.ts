import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface TryoutRequest {
  name: string;
  email: string;
  phone: string;
  age: string;
  experience: string;
  message: string;
  recaptchaToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class TryoutService {
  #supabaseClient = inject(SupabaseService).client;

  async submitTryoutForm(request: TryoutRequest) {
    const { error: functionError } = await this.#supabaseClient.functions.invoke('send-tryout-email', {
      body: { request }
    });

    if (functionError) {
      console.error('Error sending tryout email:', functionError);
      throw functionError;
    }

    return request;
  }
}