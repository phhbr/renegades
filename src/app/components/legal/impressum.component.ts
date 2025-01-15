import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './impressum.component.html'
})
export class ImpressumComponent {}