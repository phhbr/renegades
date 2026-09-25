import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  DOCUMENT,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { CookieConsentComponent } from "./components/cookie-consent/cookie-consent.component";
import { FooterComponent } from "./components/footer/footer.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { LanguageService } from "./services/language.service";
import { MetaService } from "./services/meta.service";
import { ThemeService } from "./services/theme.service";

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
  #themeService = inject(ThemeService);
  readonly isDarkMode = this.#themeService.isDarkMode;
  #languageService = inject(LanguageService);
  #metaService = inject(MetaService);
  #document = inject(DOCUMENT);
  #platformId = inject(PLATFORM_ID);
  #router = inject(Router);
  #routerInitialized = false;

  constructor() {
    this.#metaService.setDefault();

    effect(() => {
      const lang = this.#languageService.currentLang();
      this.#document.documentElement.setAttribute('lang', lang);
    });
  }

  ngAfterViewInit(): void {
    this.#signalPrerenderReady();
  }

  toggleTheme() {
    this.#themeService.toggle();
  }

  #signalPrerenderReady() {
    if (!this.#routerInitialized && isPlatformBrowser(this.#platformId)) {
      this.#routerInitialized = true;
      (window as any)["prerenderReady"] = true;
    }
  }
}
