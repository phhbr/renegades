import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { CookieConsentComponent } from "./components/cookie-consent/cookie-consent.component";
import { FooterComponent } from "./components/footer/footer.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { AnalyticsService } from "./services/analytics.service";
import { MetaService } from "./services/meta.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    CookieConsentComponent,
  ],
  templateUrl: "./app.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  isDarkMode = signal(false);
  #analyticsService = inject(AnalyticsService);
  #metaService = inject(MetaService);
  #platformId = inject(PLATFORM_ID);
  #router = inject(Router);
  #routerInitialized = false;

  constructor() {
    // Initialize default meta tags
    this.#metaService.setDefault();

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      this.isDarkMode.set(true);
    }

    effect(() =>
      document.documentElement.classList.toggle("dark", this.isDarkMode())
    );
  }

  ngAfterViewInit(): void {
    this.#signalPrerenderReady();
  }

  toggleTheme() {
    this.isDarkMode.update((current) => !current);
    this.#analyticsService.trackEvent("toggle_theme", {
      theme: this.isDarkMode() ? "dark" : "light",
    });
  }

  #signalPrerenderReady() {
    if (!this.#routerInitialized && !!window) {
      this.#routerInitialized = true;
      setTimeout(() => {
        (window as any)["prerenderReady"] = true;
        console.warn("✅ Prerender Ready Signal sent");
      }, 3000);
    }
  }
}
