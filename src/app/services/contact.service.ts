import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  #supabaseClient = inject(SupabaseService).client;

  async submitContactForm(message: Omit<ContactMessage, 'id' | 'created_at'>) {
    const { data, error } = await this.#supabaseClient
      .from('contact_messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }

    // Trigger Edge Function to send email
    const { error: functionError } = await this.#supabaseClient.functions.invoke('send-contact-email', {
      body: { message: data }
    });

    if (functionError) {
      console.error('Error sending email:', functionError);
      throw functionError;
    }

    return data;
  }
}