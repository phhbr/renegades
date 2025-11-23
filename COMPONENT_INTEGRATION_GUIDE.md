# Component Integration Examples

## Integrating MetaService into All Pages

Update each component following this pattern:

### Team Component
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { MetaService } from '../../services/meta.service';

@Component({
  selector: 'app-team',
  standalone: true,
  // ... other config
})
export class TeamComponent implements OnInit {
  private metaService = inject(MetaService);

  ngOnInit() {
    this.metaService.updateMeta({
      title: 'Meet the Nürnberg Renegades Team - Flag Football Players',
      description: 'Meet the talented and dedicated flag football players of Nürnberg Renegades e.V. Learn about our athletes competing in the DFFL.',
      keywords: 'team, players, flag football, nürnberg, renegades',
      canonical: 'https://nuernberg-renegades.de/team',
      image: 'https://nuernberg-renegades.de/assets/images/team-photo.jpg',
      imageAlt: 'Nürnberg Renegades team members'
    });
  }
}
```

### Club Component
```typescript
@Component({
  selector: 'app-club',
  standalone: true,
  // ... other config
})
export class ClubComponent implements OnInit {
  private metaService = inject(MetaService);

  ngOnInit() {
    this.metaService.updateMeta({
      title: 'About Nürnberg Renegades Club - Flag Football',
      description: 'Learn about Nürnberg Renegades e.V. - our mission, history, and commitment to competitive flag football in the DFFL First Division.',
      keywords: 'about, club, nürnberg, renegades, flag football, DFFL',
      canonical: 'https://nuernberg-renegades.de/club',
      type: 'website'
    });
  }
}
```

### Training Component
```typescript
@Component({
  selector: 'app-training',
  standalone: true,
  // ... other config
})
export class TrainingComponent implements OnInit {
  private metaService = inject(MetaService);

  ngOnInit() {
    this.metaService.updateMeta({
      title: 'Flag Football Training & Tryouts - Nürnberg Renegades',
      description: 'Join our flag football training sessions in Nürnberg. Learn the sport, meet new players, and compete at all skill levels.',
      keywords: 'training, tryouts, flag football, nürnberg, join team',
      canonical: 'https://nuernberg-renegades.de/training',
      image: 'https://nuernberg-renegades.de/assets/images/training.jpg',
      imageAlt: 'Flag football training session'
    });
  }
}
```

### Sponsoring Component
```typescript
@Component({
  selector: 'app-sponsoring',
  standalone: true,
  // ... other config
})
export class SponsoringComponent implements OnInit {
  private metaService = inject(MetaService);

  ngOnInit() {
    this.metaService.updateMeta({
      title: 'Sponsor Nürnberg Renegades - Support Flag Football',
      description: 'Become a sponsor of Nürnberg Renegades e.V. Support competitive flag football in Germany and reach our community.',
      keywords: 'sponsoring, sponsor, support, flag football, partnership',
      canonical: 'https://nuernberg-renegades.de/sponsoring'
    });
  }
}
```

### Contact Component
```typescript
@Component({
  selector: 'app-contact',
  standalone: true,
  // ... other config
})
export class ContactComponent implements OnInit {
  private metaService = inject(MetaService);

  ngOnInit() {
    this.metaService.updateMeta({
      title: 'Contact Nürnberg Renegades - Get in Touch',
      description: 'Have questions about our flag football club? Contact Nürnberg Renegades e.V. - we\'d love to hear from you!',
      keywords: 'contact, inquiry, get in touch, flag football',
      canonical: 'https://nuernberg-renegades.de/contact'
    });
  }
}
```

### Impressum Component
```typescript
@Component({
  selector: 'app-impressum',
  standalone: true,
  // ... other config
})
export class ImpressumComponent implements OnInit {
  private metaService = inject(MetaService);

  ngOnInit() {
    this.metaService.updateMeta({
      title: 'Impressum - Nürnberg Renegades e.V.',
      description: 'Legal information and impressum for Nürnberg Renegades e.V.',
      canonical: 'https://nuernberg-renegades.de/impressum'
    });
  }
}
```

### Privacy Component
```typescript
@Component({
  selector: 'app-privacy',
  standalone: true,
  // ... other config
})
export class PrivacyComponent implements OnInit {
  private metaService = inject(MetaService);

  ngOnInit() {
    this.metaService.updateMeta({
      title: 'Datenschutz (Privacy Policy) - Nürnberg Renegades e.V.',
      description: 'Privacy policy and data protection information for Nürnberg Renegades e.V. website.',
      canonical: 'https://nuernberg-renegades.de/datenschutz'
    });
  }
}
```

---

## Using the LazyLoadImageDirective

### In Home Component Template
```html
<!-- Hero Image -->
<section 
  class="min-h-[100vh] flex items-center justify-center"
  [style.backgroundImage]="'url(' + heroImage + ')'"
>
  <!-- Or use img tag -->
  <img 
    appLazyLoad 
    [dataSrc]="'/assets/images/hero-flag-football.avif'"
    alt="Nürnberg Renegades flag football team"
    class="w-full h-full object-cover absolute inset-0"
  />
</section>

<!-- Team Photos -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
  @for (player of players(); track player.id) {
    <div>
      <img 
        appLazyLoad 
        [dataSrc]="player.imageUrl"
        [alt]="player.name"
        class="w-full h-64 object-cover rounded-lg"
      />
      <h3>{{ player.name }}</h3>
    </div>
  }
</div>
```

### In Club Component
```html
<section class="gallery">
  @for (image of clubPhotos(); track image.id) {
    <img 
      appLazyLoad 
      [dataSrc]="image.url"
      [alt]="image.title"
      class="gallery-image"
    />
  }
</section>
```

---

## Performance Optimization Checklist

### Before Deployment

- [ ] Update MetaService calls in all route components
- [ ] Add alt text to all images (accessibility + SEO)
- [ ] Convert all images to modern formats (AVIF/WebP)
- [ ] Test responsive design on mobile/tablet
- [ ] Run Lighthouse audit
- [ ] Check Google PageSpeed Insights
- [ ] Verify sitemap.xml loads correctly
- [ ] Test robots.txt accessibility
- [ ] Check Core Web Vitals scores
- [ ] Validate HTML/CSS with W3C validators
- [ ] Test in multiple browsers
- [ ] Test with reduced internet speed (throttling)

### Search Engine Submission

1. **Google Search Console:**
   - Go to https://search.google.com/search-console
   - Add your site
   - Upload/verify sitemap.xml
   - Monitor coverage and issues

2. **Bing Webmaster Tools:**
   - Go to https://www.bing.com/webmasters
   - Add your site
   - Upload sitemap.xml

3. **Google My Business:**
   - Create listing for sports club
   - Add location, hours, contact info
   - Upload team photos

---

## Monitoring & Continuous Improvement

### Tools to Use

1. **Google PageSpeed Insights:** https://pagespeed.web.dev/
2. **Lighthouse:** Built into Chrome DevTools
3. **GTmetrix:** https://gtmetrix.com/
4. **WebPageTest:** https://www.webpagetest.org/
5. **Screaming Frog:** For SEO crawls
6. **Semrush:** For keyword research

### Core Web Vitals to Monitor

- **LCP (Largest Contentful Paint):** Target < 2.5s
- **FID (First Input Delay):** Target < 100ms
- **CLS (Cumulative Layout Shift):** Target < 0.1
- **TTFB (Time to First Byte):** Target < 600ms

