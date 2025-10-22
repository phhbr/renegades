import { Component, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface Feature {
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  aboutUsKey = signal('home.about.description');
  
  features = signal<Feature[]>([
    {
      titleKey: 'home.features.community.title',
      descriptionKey: 'home.features.community.description'
    },
    {
      titleKey: 'home.features.development.title',
      descriptionKey: 'home.features.development.description'
    },
    {
      titleKey: 'home.features.competition.title',
      descriptionKey: 'home.features.competition.description'
    }
  ]);
}