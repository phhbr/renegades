import { Component, signal, OnInit, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MetaService } from '../../services/meta.service';
import { ResponsiveImageComponent } from '../responsive-image/responsive-image.component';

interface Feature {
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ResponsiveImageComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private meta = inject(MetaService);

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

  ngOnInit(): void {
    this.meta.updateMeta({
      title: 'Nürnberg Renegades e.V. - Flag Football Club in Nürnberg | 1. DFFL',
      description: 'Join Nürnberg Renegades e.V., Nürnberg\'s premier flag football club competing in the DFFL First Division. Professional coaching, welcoming community, and competitive play for all skill levels.',
      canonical: 'https://nuernberg-renegades.de/',
      image: 'https://nuernberg-renegades.de/assets/images/hero-flag-football.avif',
      imageAlt: 'Nürnberg Renegades flag football team'
    });
  }
}