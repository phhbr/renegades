import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'article';
  canonical?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private meta = inject(Meta);
  private title = inject(Title);

  updateMeta(data: PageMeta): void {
    // Update title
    this.title.setTitle(data.title);

    // Update description
    this.meta.updateTag({
      name: 'description',
      content: data.description
    });

    // Update keywords if provided
    if (data.keywords) {
      this.meta.updateTag({
        name: 'keywords',
        content: data.keywords
      });
    }

    // Update Open Graph
    this.meta.updateTag({
      property: 'og:title',
      content: data.title
    });

    this.meta.updateTag({
      property: 'og:description',
      content: data.description
    });

    if (data.image) {
      this.meta.updateTag({
        property: 'og:image',
        content: data.image
      });
    }

    if (data.imageAlt) {
      this.meta.updateTag({
        property: 'og:image:alt',
        content: data.imageAlt
      });
    }

    if (data.type) {
      this.meta.updateTag({
        property: 'og:type',
        content: data.type
      });
    }

    // Update canonical
    if (data.canonical) {
      this.meta.updateTag({
        rel: 'canonical',
        href: data.canonical
      });
    }

    // Update Twitter Card
    this.meta.updateTag({
      name: 'twitter:title',
      content: data.title
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: data.description
    });

    if (data.image) {
      this.meta.updateTag({
        name: 'twitter:image',
        content: data.image
      });
    }
  }

  setDefault(): void {
    this.updateMeta({
      title: 'Nürnberg Renegades e.V. - Flag Football Club in Nürnberg | 1. DFFL',
      description: 'Join Nürnberg Renegades e.V., Nürnberg\'s premier flag football club competing in DFFL First Division. Professional coaching, welcoming community, and competitive play for all skill levels.',
      keywords: 'flag football nürnberg, flag football nuremberg, DFFL, Deutsche Flag Football Liga, Nürnberg Renegades',
      canonical: 'https://nuernberg-renegades.de/',
      image: 'https://nuernberg-renegades.de/assets/images/hero-flag-football.avif'
    });
  }
}
