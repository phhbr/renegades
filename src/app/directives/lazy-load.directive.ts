import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

/**
 * Lazy load images with Intersection Observer API
 * Usage: <img appLazyLoad data-src="image.jpg" alt="description">
 */
@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit {
  @Input() dataSrc!: string;
  @Input() placeholder?: string;

  private element = inject(ElementRef);

  ngOnInit(): void {
    if (!this.dataSrc) return;

    const img = this.element.nativeElement;

    // Set placeholder if provided
    if (this.placeholder) {
      img.src = this.placeholder;
    }

    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement;
            image.src = this.dataSrc;
            image.removeAttribute('data-src');
            observer.unobserve(image);
          }
        });
      }, {
        rootMargin: '50px'
      });

      observer.observe(img);
    } else {
      // Fallback for browsers without Intersection Observer
      img.src = this.dataSrc;
    }
  }
}
