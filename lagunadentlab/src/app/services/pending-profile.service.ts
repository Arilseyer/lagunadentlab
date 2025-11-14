/**
 * Servicio para gestionar actualizaciones de perfil pendientes cuando no hay conexión.
 * Guarda los cambios en localStorage y los sincroniza automáticamente al reconectar.
 */
import { Injectable } from '@angular/core';
import { OnlineService } from './online.service';
import { DataService } from './data.service';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

interface PendingProfileUpdate {
  uid: string;
  name: string;
  phone: string;
  email: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class PendingProfileService {
  private readonly STORAGE_KEY = 'pendingProfileUpdate';
  private onlineSub?: Subscription;
  private processing = false;

  constructor(
    private onlineService: OnlineService,
    private dataService: DataService,
    private toastCtrl: ToastController
  ) {
    console.log('[PendingProfileService] Servicio inicializado');

    // Suscribirse a cambios de conexión para procesar cambios pendientes
    this.onlineSub = this.onlineService.isOnline$.subscribe(async (isOnline) => {
      if (isOnline && !this.processing) {
        console.log('[PendingProfileService] Conexión restaurada, verificando cambios pendientes...');
        // Delay para asegurar que la conexión está estable
        setTimeout(() => this.processPendingUpdate(), 1000);
      }
    });

    // Procesar al iniciar si hay algo pendiente y hay conexión
    setTimeout(() => {
      if (this.onlineService.isOnline && this.hasPendingUpdate()) {
        console.log('[PendingProfileService] Procesando cambios pendientes al iniciar...');
        this.processPendingUpdate();
      }
    }, 2000);
  }

  /**
   * Guarda temporalmente los cambios de perfil en localStorage
   */
  savePendingUpdate(uid: string, name: string, phone: string, email: string): void {
    const update: PendingProfileUpdate = {
      uid,
      name,
      phone,
      email,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(update));
      console.log('[PendingProfileService] Cambios guardados temporalmente:', update);
    } catch (error) {
      console.error('[PendingProfileService] Error al guardar en localStorage:', error);
    }
  }

  /**
   * Verifica si hay cambios pendientes
   */
  hasPendingUpdate(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored !== null;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene los cambios pendientes
   */
  getPendingUpdate(): PendingProfileUpdate | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as PendingProfileUpdate;
    } catch (error) {
      console.error('[PendingProfileService] Error al leer localStorage:', error);
      return null;
    }
  }

  /**
   * Procesa y sincroniza los cambios pendientes con el servidor
   */
  async processPendingUpdate(): Promise<boolean> {
    if (this.processing) {
      console.log('[PendingProfileService] Ya hay un proceso en ejecución');
      return false;
    }

    if (!this.onlineService.isOnline) {
      console.log('[PendingProfileService] Sin conexión, esperando...');
      return false;
    }

    const update = this.getPendingUpdate();
    if (!update) {
      console.log('[PendingProfileService] No hay cambios pendientes');
      return false;
    }

    this.processing = true;
    console.log('[PendingProfileService] Procesando cambios pendientes...', update);

    try {
      // Intentar guardar en Firestore
      await this.dataService.saveUserProfile(update.uid, {
        name: update.name,
        phone: update.phone,
        email: update.email,
        updatedAt: new Date()
      });

      console.log('[PendingProfileService] Perfil actualizado exitosamente');
      
      // Limpiar localStorage
      localStorage.removeItem(this.STORAGE_KEY);
      
      // Mostrar toast de éxito
      await this.showToast(
        'Perfil actualizado: tus cambios se han guardado correctamente',
        'success',
        4000
      );

      this.processing = false;
      return true;
    } catch (error) {
      console.error('[PendingProfileService] ❌ Error al actualizar perfil:', error);
      
      await this.showToast(
        'Error al sincronizar perfil. Se volverá a intentar.',
        'danger',
        3000
      );

      this.processing = false;
      return false;
    }
  }

  /**
   * Cancela los cambios pendientes
   */
  clearPendingUpdate(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('[PendingProfileService] Cambios pendientes cancelados');
    } catch (error) {
      console.error('[PendingProfileService] Error al limpiar localStorage:', error);
    }
  }

  private async showToast(message: string, color: string, duration: number): Promise<void> {
    try {
      const toast = await this.toastCtrl.create({
        message,
        color,
        duration,
        position: 'bottom'
      });
      await toast.present();
    } catch (error) {
      console.error('[PendingProfileService] Error al mostrar toast:', error);
    }
  }

  ngOnDestroy(): void {
    this.onlineSub?.unsubscribe();
  }
}
