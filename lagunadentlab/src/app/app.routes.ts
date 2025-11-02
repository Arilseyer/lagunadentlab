import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  
  // Páginas principales
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services.page').then(m => m.ServicesPage)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then(m => m.AboutPage)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.page').then(m => m.ContactPage)
  },
  {
    path: 'requestservices',
    loadComponent: () => import('./pages/requestservices/requestservices.page').then(m => m.RequestservicesPage)
  },
  
  // Autenticación
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'forgotpassword',
    loadComponent: () => import('./pages/forgotpassword/forgotpassword.page').then(m => m.ForgotpasswordPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  
  // Administración
  {
    path: 'admindates',
    loadComponent: () => import('./pages/admindates/admindates.page').then(m => m.AdmindatesPage)
  },
  
  // Error handling
  {
    path: 'notfound',
    loadComponent: () => import('./pages/notfound/notfound.page').then(m => m.NotfoundPage)
  },
  {
    path: '**',
    redirectTo: 'notfound'
  }
];