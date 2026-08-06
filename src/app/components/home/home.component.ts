import { Component, signal, OnInit, inject } from '@angular/core';
import { LocalePathPipe } from '../../pipes/locale-path.pipe';

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
  imports: [RouterLink, TranslatePipe, LocalePathPipe],
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
      titleKey: 'meta.home.title',
      descriptionKey: 'meta.home.description',
      path: '/',
      image: 'https://www.nuernberg-renegades.de/assets/images/hero-flag-football.avif',
      imageAlt: 'Nürnberg Renegades flag football team'
    });
  }
}