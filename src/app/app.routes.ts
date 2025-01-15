import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'team',
    loadComponent: () => import('./components/team/team.component').then(m => m.TeamComponent)
  },
  {
    path: 'training',
    loadComponent: () => import('./components/training/training.component').then(m => m.TrainingComponent)
  },
  {
    path: 'sponsoring',
    loadComponent: () => import('./components/sponsoring/sponsoring.component').then(m => m.SponsoringComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'impressum',
    loadComponent: () => import('./components/legal/impressum.component').then(m => m.ImpressumComponent)
  },
  {
    path: 'datenschutz',
    loadComponent: () => import('./components/legal/privacy.component').then(m => m.PrivacyComponent)
  }
];