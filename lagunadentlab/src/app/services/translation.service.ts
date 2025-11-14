import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'es' | 'en';

export interface Translations {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly LANGUAGE_KEY = 'selected-language';
  private currentLanguageSubject = new BehaviorSubject<Language>('es');
  private translationsSubject = new BehaviorSubject<Translations>({});

  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  public translations$ = this.translationsSubject.asObservable();

  private translations: { [lang in Language]: Translations } = {
    es: {}, // Se cargará dinámicamente
    en: {}  // Se cargará dinámicamente
  };

  constructor() {
    this.initializeLanguage();
  }

  /**
   * Inicializa el idioma basado en la preferencia guardada o detecta el del navegador
   */
  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem(this.LANGUAGE_KEY) as Language;
    const browserLanguage = this.detectBrowserLanguage();
    const language = savedLanguage || browserLanguage;
    
    this.loadLanguage(language);
  }

  /**
   * Detecta el idioma del navegador
   */
  private detectBrowserLanguage(): Language {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'es' ? 'es' : 'en';
  }

  /**
   * Carga un idioma específico
   */
  async loadLanguage(language: Language): Promise<void> {
    try {
      // Cargar traducciones con ruta absoluta para evitar problemas de base href o rutas relativas
      const url = this.getI18nUrl(language);
      const response = await fetch(url, { cache: 'no-cache' });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} at ${url}`);
      }
      
      const translations = await response.json();
      this.translations[language] = translations;
      
      this.currentLanguageSubject.next(language);
      this.translationsSubject.next(this.translations[language]);
      
      localStorage.setItem(this.LANGUAGE_KEY, language);
      
      // Actualizar el atributo lang del documento
      document.documentElement.lang = language;
      
    } catch (error) {
      console.error(`Error loading language ${language}:`, error);
      
      // Fallback a español si falla cargar inglés
      if (language === 'en') {
        this.loadLanguage('es');
      }
    }
  }

  /**
   * Construye la URL absoluta a los archivos de i18n bajo /assets/i18n
   * Usar ruta absoluta evita problemas cuando el app corre detrás de subrutas o diferentes base href
   */
  private getI18nUrl(language: Language): string {
    // Construir URL usando la base actual del documento para soportar subrutas/custom domains
    try {
      const base = (typeof document !== 'undefined' && document.baseURI) ? document.baseURI : '/';
      const url = new URL(`assets/i18n/${language}.json`, base);
      return url.toString();
    } catch {
      // Fallback a ruta absoluta en caso de fallo
      return `/assets/i18n/${language}.json`;
    }
  }

  /**
   * Cambia al siguiente idioma disponible
   */
  toggleLanguage(): void {
    const currentLang = this.currentLanguageSubject.value;
    const nextLang: Language = currentLang === 'es' ? 'en' : 'es';
    this.loadLanguage(nextLang);
  }

  /**
   * Obtiene una traducción por su clave
   */
  translate(key: string, params?: { [key: string]: any }): string {
    const currentTranslations = this.translationsSubject.value;
    const translation = this.getNestedTranslation(currentTranslations, key);
    
    if (translation) {
      return this.interpolateParams(translation, params);
    }
    
    // Si no encuentra la traducción, devolver la clave para debug
    console.warn(`Translation not found for key: ${key}`);
    return key;
  }

  /**
   * Obtiene una traducción anidada usando dot notation (ej: "navbar.home")
   */
  private getNestedTranslation(obj: any, key: string): string | null {
    return key.split('.').reduce((o, k) => (o && o[k]) ? o[k] : null, obj);
  }

  /**
   * Interpola parámetros en la traducción
   */
  private interpolateParams(translation: string, params?: { [key: string]: any }): string {
    if (!params) return translation;
    
    let result = translation;
    Object.keys(params).forEach(key => {
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), params[key]);
    });
    
    return result;
  }

  /**
   * Obtiene el idioma actual
   */
  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  /**
   * Obtiene el nombre del idioma actual para mostrar en UI
   */
  getCurrentLanguageName(): string {
    const currentLang = this.currentLanguageSubject.value;
    return currentLang === 'es' ? 'Español' : 'English';
  }

  /**
   * Obtiene el código del idioma que seguirá (para mostrar en botón)
   */
  getNextLanguageCode(): string {
    const currentLang = this.currentLanguageSubject.value;
    return currentLang === 'es' ? 'EN' : 'ES';
  }

  /**
   * Obtiene la bandera del idioma actual
   */
  getCurrentLanguageFlag(): string {
    const currentLang = this.currentLanguageSubject.value;
    return currentLang === 'es' ? '🇪🇸' : '🇺🇸';
  }

  /**
   * Verifica si un idioma está disponible
   */
  isLanguageAvailable(language: Language): boolean {
    return Object.keys(this.translations).includes(language);
  }

  /**
   * Obtiene todos los idiomas disponibles
   */
  getAvailableLanguages(): Language[] {
    return ['es', 'en'];
  }
}