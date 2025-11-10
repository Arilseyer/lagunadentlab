import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Lista de URLs de imágenes externas a precalentar (Unsplash, etc.)
const WARM_UP_URLS: string[] = [
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80',
];

@Injectable({ providedIn: 'root' })
export class SwWarmupService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Ejecutar en segundo plano sin bloquear el arranque de la app
      setTimeout(() => {
        void this.prefetchWarmUrls();
      }, 0);
    }
  }

  private async prefetchWarmUrls(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) return;
      if (!navigator.onLine) return; // Solo calentar con conexión
      // Esperar a que el SW esté listo (registrado)
      await navigator.serviceWorker.ready;

      // Asegurar que esta pestaña ya esté controlada por el SW
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          const onChange = () => {
            navigator.serviceWorker.removeEventListener('controllerchange', onChange);
            resolve();
          };
          navigator.serviceWorker.addEventListener('controllerchange', onChange);
        });
      }

      // Disparar solicitudes de imagen (como lo haría <img>) para que el SW las capture y las cachee
      for (const url of WARM_UP_URLS) {
        try {
          await this.loadImage(url);
        } catch {
          // Ignorar errores individuales y continuar
        }
      }
    } catch {
      // Silenciar errores globales de warm-up
    }
  }

  private loadImage(src: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  }
}
