import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "../../pipes/translate.pipe";
import { MembershipService } from "../../services/membership.service";
import { RecaptchaService } from "../../services/recaptcha.service";

@Component({
  selector: "app-membership-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: "./membership-form.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipFormComponent {
  membershipForm: FormGroup;
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);
  currentYear = new Date().getFullYear();
  nextYear = this.currentYear + 1;

  constructor(
    private fb: FormBuilder, 
    private membershipService: MembershipService,
    private recaptchaService: RecaptchaService
  ) {
    this.membershipForm = this.fb.group({
      membership_active: [false],
      membership_support: [false],
      name: ["", Validators.required],
      firstname: ["", Validators.required],
      birthday: ["", Validators.required],
      birthplace: ["", Validators.required],
      profession: [""],
      nationality: [""],
      street: ["", Validators.required],
      plz_town: ["", Validators.required],
      tel: [""],
      fax: [""],
      mobile: [""],
      email: ["", [Validators.required, Validators.email]],
      joindate_month: ["", Validators.required],
      joindate_year: ["", Validators.required],
      sepa_account_holder_name: [""],
      sepa_account_holder_firstname: [""],
      sepa_iban: [""],
      sepa_bic: [""],
      sepa_bank: [""],
    });
  }

  async onSubmit() {
    if (this.membershipForm.valid) {
      this.isSubmitting.set(true);
      this.submitSuccess.set(false);
      this.submitError.set(false);

      try {
        const recaptchaToken = await this.recaptchaService.executeRecaptcha('membership_form');
        await this.membershipService.submitMembershipApplication({
          ...this.membershipForm.value,
          recaptchaToken
        });
        this.submitSuccess.set(true);
        this.membershipForm.reset();
      } catch (error) {
        console.error("Error submitting form:", error);
        this.submitError.set(true);
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }
}