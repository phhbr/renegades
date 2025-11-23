import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Responsive Image Component
 * Automatically generates srcset for modern image formats (AVIF, WebP, JPEG)
 * with responsive sizes for multiple breakpoints.
 *
 * Usage:
 * <app-responsive-image
 *   [src]="'logo-avatar'"
 *   [alt]="'Team logo'"
 *   [sizes]="'(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'"
 *   [class]="'w-full h-auto'"
 * ></app-responsive-image>
 */
@Component({
  selector: 'app-responsive-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <picture>
      <!-- AVIF format (best compression) -->
      <source
        [srcset]="generateSrcset('avif')"
        [sizes]="sizes"
        type="image/avif"
      />
      <!-- WebP format (good compression) -->
      <source
        [srcset]="generateSrcset('webp')"
        [sizes]="sizes"
        type="image/webp"
      />
      <!-- JPEG fallback -->
      <img
        [src]="fallbackSrc"
        [alt]="alt"
        [class]="imageClass"
        loading="lazy"
        [srcset]="generateSrcset('jpg')"
        [sizes]="sizes"
      />
    </picture>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsiveImageComponent {
  @Input() src!: string; // Image name without extension (e.g., 'logo-avatar')
  @Input() alt: string = 'Image';
  @Input() sizes: string = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  @Input() imageClass: string = 'w-full h-auto';
  @Input() basePath: string = '/assets/images/optimized'; // Path to optimized images

  // Responsive breakpoints (must match optimize-images.js SIZES)
  private breakpoints = [640, 1024, 1280, 1920];

  get fallbackSrc(): string {
    return `${this.basePath}/${this.src}-full.jpg`;
  }

  /**
   * Generate srcset string for given format
   * Example output: "/assets/images/optimized/logo-640w.avif 640w, /assets/images/optimized/logo-1024w.avif 1024w"
   */
  generateSrcset(format: 'avif' | 'webp' | 'jpg'): string {
    const srcsets = this.breakpoints
      .map(bp => `${this.basePath}/${this.src}-${bp}w.${format} ${bp}w`)
      .join(', ');
    
    // Add full-size version
    return `${srcsets}, ${this.basePath}/${this.src}-full.${format} 2000w`;
  }
}
