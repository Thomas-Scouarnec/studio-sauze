import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';

export const routes: Routes = [
  // The landing page stays eager; only guests download the stay page.
  { path: '', component: HomeComponent, title: 'Notre Refuge au Sauze' },
  {
    path: 'stay',
    loadComponent: () => import('./pages/stay/stay').then((m) => m.StayComponent),
    title: 'Votre séjour — Notre Refuge au Sauze'
  },
  { path: '**', redirectTo: '' }
];
