import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonHeader, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { globeOutline, sunnyOutline, personCircleOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonIcon, CommonModule]
})
export class NavbarComponent implements OnInit {
  activeRoute: string = '';
  isLoggedIn$!: Observable<boolean>;

  constructor(private router: Router, private auth: AuthService) { 
    addIcons({globeOutline,sunnyOutline,personCircleOutline,personOutline});
  }

  ngOnInit() {
    // Estado de autenticación
    this.isLoggedIn$ = this.auth.user$.pipe(
      map(user => !!user)
    );
    // Detectar la ruta activa al inicializar
    this.setActiveRoute(this.router.url);
    
    // Escuchar cambios de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setActiveRoute(event.url);
      }
    });
  }

  private setActiveRoute(url: string) {
    // Extraer la ruta base sin parámetros
    const route = url.split('?')[0].split('#')[0];
    
    if (route === '/' || route === '/home') {
      this.activeRoute = 'home';
    } else if (route === '/services') {
      this.activeRoute = 'services';
    } else if (route === '/about') {
      this.activeRoute = 'about';
    } else if (route === '/contact') {
      this.activeRoute = 'contact';
    } else {
      this.activeRoute = '';
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}