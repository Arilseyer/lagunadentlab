import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme-preference';
  private currentThemeSubject = new BehaviorSubject<ThemeMode>('auto');
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);

  public currentTheme$ = this.currentThemeSubject.asObservable();
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  /**
   * Inicializa el tema basado en la preferencia guardada o usa 'auto' por defecto
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    const theme = savedTheme || 'auto';
    this.setTheme(theme);
  }

  /**
   * Escucha cambios en el tema del sistema
   */
  private setupSystemThemeListener(): void {
    if (window.matchMedia) {
      const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkMediaQuery.addEventListener('change', () => {
        if (this.currentThemeSubject.value === 'auto') {
          this.updateDarkMode();
        }
      });
    }
  }

  /**
   * Establece el tema y actualiza el DOM
   */
  setTheme(theme: ThemeMode): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.updateDarkMode();
  }

  /**
   * Alterna entre los temas: light → dark → auto → light
   */
  toggleTheme(): void {
    const current = this.currentThemeSubject.value;
    let nextTheme: ThemeMode;

    switch (current) {
      case 'light':
        nextTheme = 'dark';
        break;
      case 'dark':
        nextTheme = 'auto';
        break;
      case 'auto':
        nextTheme = 'light';
        break;
      default:
        nextTheme = 'auto';
    }

    this.setTheme(nextTheme);
  }

  /**
   * Actualiza el estado de dark mode basado en el tema actual
   */
  private updateDarkMode(): void {
    const theme = this.currentThemeSubject.value;
    let isDark: boolean;

    switch (theme) {
      case 'dark':
        isDark = true;
        break;
      case 'light':
        isDark = false;
        break;
      case 'auto':
        isDark = this.getSystemPreference();
        break;
      default:
        isDark = false;
    }

    this.isDarkModeSubject.next(isDark);
    this.applyThemeToDocument(isDark);
  }

  /**
   * Obtiene la preferencia del sistema
   */
  private getSystemPreference(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Aplica el tema al documento
   */
  private applyThemeToDocument(isDark: boolean): void {
    document.body.classList.toggle('dark', isDark);
    
    // Actualiza el color del status bar en dispositivos móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0a0c11' : '#ffffff');
    }
  }

  /**
   * Obtiene el tema actual
   */
  getCurrentTheme(): ThemeMode {
    return this.currentThemeSubject.value;
  }

  /**
   * Verifica si actualmente está en modo oscuro
   */
  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  /**
   * Obtiene el ícono apropiado para el tema actual
   */
  getThemeIcon(): string {
    const theme = this.currentThemeSubject.value;
    const isDark = this.isDarkModeSubject.value;

    switch (theme) {
      case 'light':
        return 'sunny-outline';
      case 'dark':
        return 'moon-outline';
      case 'auto':
        return isDark ? 'phone-portrait-outline' : 'phone-portrait-outline';
      default:
        return 'sunny-outline';
    }
  }

  /**
   * Obtiene el texto descriptivo del tema actual
   */
  getThemeDescription(): string {
    const theme = this.currentThemeSubject.value;
    switch (theme) {
      case 'light':
        return 'Tema claro';
      case 'dark':
        return 'Tema oscuro';
      case 'auto':
        return 'Automático (sistema)';
      default:
        return 'Automático';
    }
  }
}