import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
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
  private doc = inject(DOCUMENT);

  private setLinkTag(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]:not([hreflang])`;
    let el = this.doc.head.querySelector<HTMLLinkElement>(selector);
    if (!el) {
      el = this.doc.createElement('link');
      el.setAttribute('rel', rel);
      if (hreflang) el.setAttribute('hreflang', hreflang);
      this.doc.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

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

    // Update og:url
    const pageUrl = data.url ?? data.canonical;
    if (pageUrl) {
      this.meta.updateTag({ property: 'og:url', content: pageUrl });
    }

    // Update canonical link tag
    if (data.canonical) {
      this.setLinkTag('canonical', data.canonical);
    }

    // Update hreflang alternate links
    if (data.canonical) {
      const base = data.canonical.split('?')[0];
      this.setLinkTag('alternate', `${base}?lang=de`, 'de');
      this.setLinkTag('alternate', `${base}?lang=en`, 'en');
      this.setLinkTag('alternate', base, 'x-default');
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
      title: 'Nürnberg Renegades e.V. - Flag Football Club in Nürnberg | 1. DFFL & Bayernliga',
      description: 'Join Nürnberg Renegades e.V., Nürnberg\'s flag football club fielding two teams: our 1st team in the 1. DFFL and our 2nd team in the Bayernliga. Professional coaching, welcoming community, and competitive play for all skill levels.',
      keywords: 'flag football nürnberg, flag football nuremberg, DFFL, Bayernliga flag football, Deutsche Flag Football Liga, Nürnberg Renegades',
      canonical: 'https://nuernberg-renegades.de/',
      image: 'https://nuernberg-renegades.de/assets/images/hero-flag-football.avif'
    });
  }

  /** Injects/replaces a page-scoped JSON-LD script tag, identified by id. */
  setJsonLd(id: string, data: unknown): void {
    this.removeJsonLd(id);
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  removeJsonLd(id: string): void {
    this.doc.getElementById(id)?.remove();
  }
}
