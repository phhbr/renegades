import { Component } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { MembershipFormComponent } from './membership-form.component';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [TranslatePipe, MembershipFormComponent],
  templateUrl: './club.component.html'
})
export class ClubComponent {}