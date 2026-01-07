import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  PLATFORM_INITIALIZER,
  signal,
} from "@angular/core";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { CookieConsentComponent } from "./components/cookie-consent/cookie-consent.component";
import { FooterComponent } from "./components/footer/footer.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { AnalyticsService } from "./services/analytics.service";
import { MetaService } from "./services/meta.service";
import { isPlatformBrowser } from "@angular/common";

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
export class AppComponent implements OnInit, AfterViewInit {
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

  ngOnInit(): void {
    if (isPlatformBrowser(this.#platformId)) {
      this.#router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          console.warn("🚀 Navigation End detected:", event.urlAfterRedirects);
          this.#signalPrerenderReady();
        }
      });
    } else {
      console.warn("🚀 Platform is not browser, signaling prerender ready.");
      this.#signalPrerenderReady();
    }
  }

  ngAfterViewInit(): void {
    console.warn("🚀 After View Init launched.");
    this.#signalPrerenderReady();
  }

  toggleTheme() {
    this.isDarkMode.update((current) => !current);
    this.#analyticsService.trackEvent("toggle_theme", {
      theme: this.isDarkMode() ? "dark" : "light",
    });
  }

  #signalPrerenderReady() {
    setTimeout(() => {
      if (this.#routerInitialized && typeof window !== "undefined") {
        (window as any)["prerenderReady"] = true;
        this.#routerInitialized = true;
        console.warn("✅ Prerender Ready Signal sent");
      }
    }, 3000);
  }
}
