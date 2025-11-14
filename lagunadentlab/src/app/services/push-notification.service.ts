import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from 'src/environments/firebase';
import { AuthService } from './auth.service';

/**
 * PushNotificationService
 * - Maneja el registro de tokens FCM para notificaciones push nativas
 * - Configura listeners para notificaciones recibidas y acciones
 * - Guarda tokens de dispositivo en Firestore para envío desde backend
 * - Funciona en Android y iOS (no en web)
 */
@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private isNativeApp = Capacitor.isNativePlatform();

  constructor(private auth: AuthService) {}

  /**
   * Inicializa el servicio de notificaciones push
   * Debe llamarse cuando el usuario inicia sesión
   */
  async initialize(): Promise<void> {
    if (!this.isNativeApp) {
      console.log('[PushNotification] No es una plataforma nativa, usando notificaciones web');
      return;
    }

    try {
      // 1. Solicitar permisos
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        console.log('[PushNotification] Permisos concedidos');
        
        // 2. Registrar dispositivo para recibir notificaciones
        await PushNotifications.register();
        
        // 3. Configurar listeners
        this.setupListeners();
      } else {
        console.warn('[PushNotification] Permisos denegados');
      }
    } catch (error) {
      console.error('[PushNotification] Error al inicializar:', error);
    }
  }

  /**
   * Configura los listeners para eventos de notificaciones
   */
  private setupListeners(): void {
    // Listener: Token registrado exitosamente
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('[PushNotification] Token FCM registrado:', token.value);
      await this.saveTokenToFirestore(token.value);
    });

    // Listener: Error al registrar
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('[PushNotification] Error al registrar:', error);
    });

    // Listener: Notificación recibida (app en foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('[PushNotification] Notificación recibida:', notification);
      // Aquí puedes mostrar un toast o alerta personalizada
    });

    // Listener: Usuario tocó la notificación (app en background/closed)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('[PushNotification] Acción de notificación:', notification);
      // Aquí puedes navegar a una página específica según el tipo de notificación
      const data = notification.notification.data;
      if (data?.appointmentId) {
        // Navegar a la página de citas o detalles
        console.log('[PushNotification] Navegar a cita:', data.appointmentId);
      }
    });
  }

  /**
   * Guarda el token FCM del dispositivo en Firestore
   * Asociado al usuario actual para enviar notificaciones dirigidas
   */
  private async saveTokenToFirestore(token: string): Promise<void> {
    try {
      const user = this.auth.getCurrentUser();
      if (!user) {
        console.warn('[PushNotification] No hay usuario autenticado para guardar token');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date(),
        platform: Capacitor.getPlatform() // 'ios' o 'android'
      });

      console.log('[PushNotification] Token guardado en Firestore para usuario:', user.uid);
    } catch (error) {
      console.error('[PushNotification] Error al guardar token:', error);
    }
  }

  /**
   * Obtiene el token FCM actual del dispositivo
   */
  async getCurrentToken(): Promise<string | null> {
    if (!this.isNativeApp) {
      return null;
    }

    try {
      // En algunas plataformas podemos obtener el token directamente
      // pero generalmente se obtiene en el listener 'registration'
      return null;
    } catch (error) {
      console.error('[PushNotification] Error al obtener token:', error);
      return null;
    }
  }

  /**
   * Limpia los listeners cuando el usuario cierra sesión
   */
  async cleanup(): Promise<void> {
    if (!this.isNativeApp) {
      return;
    }

    try {
      await PushNotifications.removeAllListeners();
      console.log('[PushNotification] Listeners removidos');
    } catch (error) {
      console.error('[PushNotification] Error al limpiar:', error);
    }
  }

  /**
   * Verifica si las notificaciones push están disponibles
   */
  isAvailable(): boolean {
    return this.isNativeApp;
  }
}
