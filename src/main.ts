import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideHttpClient } from '@angular/common/http';

// Set up Umami script with correct URL and website ID
const setupUmamiScript = () => {
  const umamiScript = document.getElementById('umami-script');
  if (umamiScript) {
    umamiScript.setAttribute('src', environment.analytics.umamiUrl);
    umamiScript.setAttribute('data-website-id', environment.analytics.websiteId);
  }
};

// Initialize analytics
setupUmamiScript();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ]
}).catch(err => console.error(err));