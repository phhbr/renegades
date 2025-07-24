import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface MembershipApplication {
  name: string;
  lastname: string;
  birthdate: string;
  birthplace: string;
  address: string;
  email: string;
  statuteAcceptance: boolean;
  recaptchaToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  #supabaseClient = inject(SupabaseService).client;

  async submitMembershipApplication(application: MembershipApplication) {
    const { error: functionError } = await this.#supabaseClient.functions.invoke('send-membership-application', {
      body: { application }
    });

    if (functionError) {
      console.error('Error sending membership application:', functionError);
      throw functionError;
    }

    return application;
  }
}