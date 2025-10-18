import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home2',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },  {
    path: 'inicio-sesion',
    loadComponent: () => import('./pages/inicio-sesion/inicio-sesion.page').then( m => m.InicioSesionPage)
  },


];
