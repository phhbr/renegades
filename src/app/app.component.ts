import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { CookieConsentComponent } from "./components/cookie-consent/cookie-consent.component";
import { FooterComponent } from "./components/footer/footer.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { AnalyticsService } from "./services/analytics.service";
import { MetaService } from "./services/meta.service";
import { environment } from "../environments/environment";

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
    this.#metaService.setDefault();

    if (isPlatformBrowser(this.#platformId)) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        this.isDarkMode.set(true);
      }

      const umamiScript = document.getElementById("umami-script");
      if (umamiScript) {
        umamiScript.setAttribute("src", environment.analytics.umamiUrl);
        umamiScript.setAttribute("data-website-id", environment.analytics.websiteId);
      }
    }

    effect(() => {
      if (isPlatformBrowser(this.#platformId)) {
        document.documentElement.classList.toggle("dark", this.isDarkMode());
      }
    });
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
    if (!this.#routerInitialized && isPlatformBrowser(this.#platformId)) {
      this.#routerInitialized = true;
      (window as any)["prerenderReady"] = true;
    }
  }
}
