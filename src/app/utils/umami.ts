import { environment } from '../../environments/environment';

// Set up Umami script with correct URL and website ID
export const setupUmamiScript = () => {
    const umamiScript = document.getElementById('umami-script');
    if (umamiScript) {
        umamiScript.setAttribute('src', environment.analytics.umamiUrl);
        umamiScript.setAttribute('data-website-id', environment.analytics.websiteId);
    }
};