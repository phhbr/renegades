import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  recaptchaToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  #supabaseService = inject(SupabaseService);

  async submitContactForm(message: ContactMessage) {
    const { error: functionError } = await this.#supabaseService.client.functions.invoke('send-contact-email', {
      body: { message }
    });

    if (functionError) {
      console.error('Error sending email:', functionError);
      throw functionError;
    }

    return message;
  }
}