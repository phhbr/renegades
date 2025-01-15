import { Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CookieConsentComponent, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  isDarkMode = signal(false);

  constructor() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDarkMode.set(true);
    }

    effect(() => {
      document.documentElement.classList.toggle('dark', this.isDarkMode());
    });
  }

  toggleTheme() {
    this.isDarkMode.update(current => !current);
  }
}