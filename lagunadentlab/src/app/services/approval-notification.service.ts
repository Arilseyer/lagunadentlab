import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from './auth.service';
import { db } from 'src/environments/firebase';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { Subscription } from 'rxjs';

/**
 * ApprovalNotificationService
 * - Escucha cambios en citas del usuario activo.
 * - Cuando una cita pasa de Pendiente -> Aprobada, muestra:
 *   - Notificación del navegador (si el permiso está concedido)
 *   - Toast interno de Ionic
 * - Evita duplicados con:
 *   - Campo persistente `approvedNotified: true` en el documento
 *   - Tag de notificación del navegador basado en el ID de la cita
 */
@Injectable({ providedIn: 'root' })
export class ApprovalNotificationService {
  private authSub?: Subscription;
  private unsubAppointments?: () => void;
  private lastStatuses = new Map<string, string>();
  private started = false;

  constructor(
    private auth: AuthService,
    private toastCtrl: ToastController
  ) {}

  start() {
    if (this.started) return;
    this.started = true;

    // Suscribirse a cambios de sesión
    this.authSub = this.auth.user$.subscribe(user => {
      // Limpiar listener anterior
      if (this.unsubAppointments) {
        this.unsubAppointments();
        this.unsubAppointments = undefined;
      }
      this.lastStatuses.clear();

      if (!user) return; // sin usuario, no hay nada que escuchar

      // Listener a citas del usuario
      const ref = collection(db, 'appointments');
      // Nota: podríamos filtrar también por status == 'Aprobada' con un índice compuesto.
      // Para evitar requerir índice, filtramos por uid y comparamos localmente cambios.
      const q = query(ref, where('uid', '==', user.uid));

      this.unsubAppointments = onSnapshot(q, async snapshot => {
        snapshot.docChanges().forEach(async change => {
          const id = change.doc.id;
          const data = change.doc.data() as any;
          const currentStatus: string = (data.status || '').toString();
          const prevStatus: string | undefined = this.lastStatuses.get(id);

          // Seed: en la primera aparición, solo guardamos el estado sin notificar
          if (change.type === 'added' && prevStatus === undefined) {
            this.lastStatuses.set(id, currentStatus);
            return;
          }

          // Registrar estado actual para siguientes comparaciones
          this.lastStatuses.set(id, currentStatus);

          // Evitar duplicados si ya marcamos persistentemente
          if (data.approvedNotified === true) return;

          // Disparar solo cuando pasa de Pendiente -> Aprobada
          if ((prevStatus === 'Pendiente' || prevStatus === 'pendiente') &&
              (currentStatus === 'Aprobada' || currentStatus === 'aprobada')) {
            await this.notifyApproval(id, data);
            // Marcar como notificado (persistente, también funciona offline y se sincroniza)
            try {
              await updateDoc(doc(db, 'appointments', id), {
                approvedNotified: true,
                approvedNotifiedAt: new Date()
              });
            } catch (e) {
              // No bloquear por error de escritura (offline u otros)
              console.warn('No se pudo marcar approvedNotified:', e);
            }
          }
        });
      });
    });
  }

  stop() {
    if (this.unsubAppointments) {
      this.unsubAppointments();
      this.unsubAppointments = undefined;
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
      this.authSub = undefined;
    }
    this.lastStatuses.clear();
    this.started = false;
  }

  private async notifyApproval(appointmentId: string, data: any) {
    // 1) Notificación del navegador
    try {
      const title = 'Tu cita fue aprobada';
      const bodyParts: string[] = [];
      if (data?.date) bodyParts.push(`Fecha: ${data.date}`);
      if (data?.time) bodyParts.push(`Hora: ${data.time}`);
      const body = bodyParts.join(' \u2022 ');

      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          try { await Notification.requestPermission(); } catch {}
        }
        if (Notification.permission === 'granted') {
          // Usar tag para deduplicar en la sesión del navegador
          new Notification(title, {
            body: body || undefined,
            tag: `appointment-approved-${appointmentId}`,
            icon: 'assets/Diente.png'
          });
        }
      }
    } catch (e) {
      console.warn('Notification API error:', e);
    }

    // 2) Toast interno
    try {
      const toast = await this.toastCtrl.create({
        message: 'Tu cita fue aprobada',
        duration: 3000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } catch (e) {
      console.warn('Toast error:', e);
    }
  }
}
