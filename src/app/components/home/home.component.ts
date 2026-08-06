import { Component, signal, OnInit, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MetaService } from '../../services/meta.service';

interface Feature {
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
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
      title: 'Nürnberg Renegades e.V. | Flag Football in Nürnberg',
      description: 'Nürnberg Renegades e.V. is a flag football club fielding two teams: our 1st team in the 1. DFFL and our 2nd team in the Bayernliga, with training and tryouts for every skill level.',
      canonical: 'https://nuernberg-renegades.de/',
      image: 'https://nuernberg-renegades.de/assets/images/hero-flag-football.avif',
      imageAlt: 'Nürnberg Renegades flag football team'
    });
  }
}