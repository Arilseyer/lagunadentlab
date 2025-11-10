import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonHeader, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { addIcons } from 'ionicons';
import { globeOutline, sunnyOutline, moonOutline, phonePortraitOutline, personCircleOutline, personOutline, menuOutline, closeOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonIcon, CommonModule, TranslatePipe]
})
export class NavbarComponent implements OnInit {
  activeRoute: string = '';
  isLoggedIn$!: Observable<boolean>;
  currentThemeIcon$!: Observable<string>;
  themeDescription$!: Observable<string>;
  currentLanguageCode$!: Observable<string>;
  logoSrc$!: Observable<string>;
  isMenuOpen = false;

  constructor(
    private router: Router, 
    private auth: AuthService,
    private themeService: ThemeService,
    private translationService: TranslationService
  ) { 
    addIcons({
      globeOutline,
      sunnyOutline,
      moonOutline,
      phonePortraitOutline,
      personCircleOutline,
      personOutline,
      menuOutline,
      closeOutline
    });
  }

  ngOnInit() {
    // Estado de autenticación
    this.isLoggedIn$ = this.auth.user$.pipe(
      map(user => !!user)
    );

    // Observables del tema
    this.currentThemeIcon$ = this.themeService.currentTheme$.pipe(
      map(() => this.themeService.getThemeIcon())
    );

    this.themeDescription$ = this.themeService.currentTheme$.pipe(
      map(() => this.themeService.getThemeDescription())
    );

    // Observable del idioma
    this.currentLanguageCode$ = this.translationService.currentLanguage$.pipe(
      map(() => this.translationService.getNextLanguageCode())
    );
    
    // Detectar la ruta activa al inicializar
    this.setActiveRoute(this.router.url);
    
    // Escuchar cambios de ruta
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.setActiveRoute(event.url);
        this.closeMenu();
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

  // Mobile menu control
  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu() { this.isMenuOpen = false; }
  onBackdropClick() { this.closeMenu(); }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.isMenuOpen) this.closeMenu(); }

  /**
   * Alterna el tema cuando se hace clic en el botón
   */
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  /**
   * Obtiene el título para el botón de tema
   */
  getThemeButtonTitle(): string {
    return `Cambiar tema - Actual: ${this.themeService.getThemeDescription()}`;
  }

  /**
   * Alterna el idioma cuando se hace clic en el botón
   */
  toggleLanguage() {
    this.translationService.toggleLanguage();
  }

  /**
   * Obtiene el título para el botón de idioma
   */
  getLanguageButtonTitle(): string {
    const currentLang = this.translationService.getCurrentLanguageName();
    const nextCode = this.translationService.getNextLanguageCode();
    return `Cambiar idioma - Actual: ${currentLang} - Cambiar a: ${nextCode}`;
  }
}