import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class OnlineService {
  private online$ = new BehaviorSubject<boolean>(true);
  private wasOffline = false; // rastrea si veníamos de estar offline
  private lastOfflineAt: number | null = null; // timestamp de la última pérdida de conexión
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private toastCtrl: ToastController,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.online$.next(navigator.onLine);
      this.wasOffline = !navigator.onLine;
      if (!navigator.onLine) this.lastOfflineAt = Date.now();
      window.addEventListener('online', () => this.handleOnlineChange(true));
      window.addEventListener('offline', () => this.handleOnlineChange(false));
    }
  }

  get isOnline$() {
    return this.online$.asObservable();
  }

  get isOnline(): boolean {
    return this.online$.value;
  }

  /**
   * Indica si recientemente (en ventana ms) se perdió la conexión.
   * Útil para evitar condiciones de carrera donde navigator.onLine aún no refleja el estado.
   */
  wasRecentlyOffline(windowMs = 2000): boolean {
    if (this.lastOfflineAt == null) return false;
    return (Date.now() - this.lastOfflineAt) <= windowMs;
  }

  /**
   * Prueba rápida de conectividad real con timeout corto.
   * No bloquea funciones críticas, solo ayuda a decidir si mostrar toasts.
   */
  async isNetworkReachable(timeoutMs = 1200): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      // 1) Preferir misma-origen para que el Service Worker intercepte y falle bajo DevTools Application > SW > Offline
      const sameOriginUrl = `${window.location.origin}/__ping?t=${Date.now()}`;
      await fetch(sameOriginUrl, {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'omit',
        signal: controller.signal,
      });
      return true; // Si resolvió (aunque sea 404), hay red
    } catch (_) {
      try {
        // 2) Fallback a recurso externo (ayuda cuando no hay SW)
        await fetch('https://www.google.com/generate_204', {
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
        });
        return true;
      } catch (_) {
        return false;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  async ensureOnlineOrToast(actionLabel = 'esta acción'): Promise<boolean> {
    if (this.isOnline) return true;
    const toast = await this.toastCtrl.create({
      message: `Sin conexión: ${actionLabel} requiere internet`,
      duration: 2500,
      color: 'warning',
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await toast.present();
    return false;
  }

  private async handleOnlineChange(isOnline: boolean) {
    const prev = this.online$.value;
    this.online$.next(isOnline);

    if (!isOnline) {
      // Marcamos que estamos offline y avisamos
      this.wasOffline = true;
      this.lastOfflineAt = Date.now();
      const toast = await this.toastCtrl.create({
        message: 'Sin conexión',
        duration: 1800,
        color: 'medium',
        position: 'bottom',
      });
      await toast.present();
      return;
    }

    // Si veníamos de estar offline y ahora estamos online, avisar reconexión global
    if (isOnline && (this.wasOffline || prev === false)) {
      this.wasOffline = false;
      const toast = await this.toastCtrl.create({
        message: 'Conexión recuperada — sincronizando en segundo plano',
        duration: 1800,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
    }
  }
}
