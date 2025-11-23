
import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ResponsiveImageComponent } from '../responsive-image/responsive-image.component';
import { MetaService } from '../../services/meta.service';
import { ContactService } from '../../services/contact.service';
import { RecaptchaService } from '../../services/recaptcha.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, ResponsiveImageComponent],
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  private meta = inject(MetaService);

  ngOnInit(): void {
    this.meta.updateMeta({
      title: 'Contact Nürnberg Renegades - Get in Touch',
      description: 'Have questions about our flag football club? Contact Nürnberg Renegades e.V. - we\'d love to hear from you!',
      canonical: 'https://nuernberg-renegades.de/contact'
    });
  }
  contactForm: FormGroup;
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private recaptchaService: RecaptchaService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      this.submitSuccess.set(false);
      this.submitError.set(false);

      try {
        const recaptchaToken = await this.recaptchaService.executeRecaptcha('contact_form');
        await this.contactService.submitContactForm({
          ...this.contactForm.value,
          recaptchaToken
        });
        this.contactForm.reset();
        this.submitSuccess.set(true);
      } catch (error) {
        console.error('Error submitting form:', error);
        this.submitError.set(true);
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }
}