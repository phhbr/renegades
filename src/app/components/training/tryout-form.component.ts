import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-tryout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tryout-form.component.html'
})
export class TryoutFormComponent {
  tryoutForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.tryoutForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(16)]],
      experience: ['']
    });
  }

  onSubmit() {
    if (this.tryoutForm.valid) {
      console.log(this.tryoutForm.value);
      // TODO: Implement form submission logic
    }
  }
}