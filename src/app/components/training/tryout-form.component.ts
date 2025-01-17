import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TranslatePipe } from "../../pipes/translate.pipe";
import { TryoutService } from "../../services/tryout.service";

@Component({
  selector: "app-tryout-form",
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: "./tryout-form.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TryoutFormComponent {
  tryoutForm: FormGroup;
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);

  constructor(private fb: FormBuilder, private tryoutService: TryoutService) {
    this.tryoutForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: [""],
      age: [""],
      experience: [""],
      message: [""],
    });
  }

  onSubmit() {
    if (this.tryoutForm.valid) {
      this.isSubmitting.set(true);
      this.submitSuccess.set(false);
      this.submitError.set(false);

      try {
        const formData = this.tryoutForm.value;
        this.tryoutService.submitTryoutForm({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          age: formData.age,
          experience: formData.experience,
          message: formData.message,
        });
        this.submitSuccess.set(true);
        this.tryoutForm.reset();
      } catch (error) {
        console.error("Error submitting form:", error);
        this.submitError.set(true);
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }
}
