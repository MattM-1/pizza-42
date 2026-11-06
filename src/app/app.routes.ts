import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { HomeComponent } from './pages/home.component';
import { MenuComponent } from './pages/menu.component';
import { ProfileComponent } from './pages/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Pizza 42' },
  { path: 'menu', component: MenuComponent, title: 'Menu | Pizza 42' },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuardFn], title: 'My Account | Pizza 42' },
  { path: '**', redirectTo: '' },
];
