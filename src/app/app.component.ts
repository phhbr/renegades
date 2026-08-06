import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  DOCUMENT,
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
import { LanguageService } from "./services/language.service";
import { MetaService } from "./services/meta.service";
import { StorageService } from "./services/storage.service";
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
  readonly #themeStorageKey = 'preferredTheme';
  isDarkMode = signal(false);
  #analyticsService = inject(AnalyticsService);
  #languageService = inject(LanguageService);
  #metaService = inject(MetaService);
  #storageService = inject(StorageService);
  #document = inject(DOCUMENT);
  #platformId = inject(PLATFORM_ID);
  #router = inject(Router);
  #routerInitialized = false;

  constructor() {
    this.#metaService.setDefault();

    const savedTheme = this.#storageService.getCookie(this.#themeStorageKey) ?? this.#storageService.getItem(this.#themeStorageKey);
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
    } else if (savedTheme === 'light') {
      this.isDarkMode.set(false);
    } else {
      const themeHint = this.#storageService.getRequestHeader('sec-ch-prefers-color-scheme');
      if (themeHint === 'dark') {
        this.isDarkMode.set(true);
      } else if (isPlatformBrowser(this.#platformId) && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        this.isDarkMode.set(true);
      }
    }

    if (isPlatformBrowser(this.#platformId)) {
      const umamiScript = document.getElementById("umami-script");
      if (umamiScript) {
        umamiScript.setAttribute("src", environment.analytics.umamiUrl);
        umamiScript.setAttribute("data-website-id", environment.analytics.websiteId);
      }
    }

    effect(() => {
      this.#document.documentElement.classList.toggle("dark", this.isDarkMode());
      this.#storageService.setItem(this.#themeStorageKey, this.isDarkMode() ? 'dark' : 'light');
      this.#storageService.setCookie(this.#themeStorageKey, this.isDarkMode() ? 'dark' : 'light');
    });

    effect(() => {
      const lang = this.#languageService.currentLang();
      this.#document.documentElement.setAttribute('lang', lang);
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
