import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class OnlineService {
  private online$ = new BehaviorSubject<boolean>(true);
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private toastCtrl: ToastController,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.online$.next(navigator.onLine);
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
    this.online$.next(isOnline);
    const toast = await this.toastCtrl.create({
      message: isOnline ? 'Conexión restaurada' : 'Sin conexión',
      duration: 1800,
      color: isOnline ? 'success' : 'medium',
      position: 'bottom',
    });
    await toast.present();
  }
}
