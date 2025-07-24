import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MembershipFormComponent } from './membership-form.component';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MembershipFormComponent],
  templateUrl: './club.component.html'
})
export class ClubComponent {}