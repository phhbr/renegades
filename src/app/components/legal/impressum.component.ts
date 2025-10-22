import { Component } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './impressum.component.html'
})
export class ImpressumComponent {}