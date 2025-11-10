import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService, CITA_ESTADOS } from '../../services/data.service';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { checkmarkCircleOutline, closeCircleOutline, timeOutline, trashOutline, refreshOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { OnlineService } from '../../services/online.service';
import { collection, onSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from 'src/environments/firebase';

interface Cita {
  id: string;
  uid: string;
  userName?: string;
  userEmail?: string;
  serviceType: string;
  date: any;
  time: string;
  status: string;
  notes?: string;
  createdAt?: any;
  _pendingSync?: boolean;
}

@Component({
  selector: 'app-admindates',
  templateUrl: './admindates.page.html',
  styleUrls: ['./admindates.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NavbarComponent, FooterComponent]
})
export class AdmindatesPage implements OnInit, OnDestroy {

  citas: Cita[] = [];
  loading: boolean = false;
  ESTADOS = CITA_ESTADOS;
  private unsubscribeAppointments?: () => void;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public onlineService: OnlineService
  ) { 
    addIcons({ 
      checkmarkCircleOutline, 
      closeCircleOutline, 
      timeOutline,
      trashOutline,
      refreshOutline
    });
  }

  async ngOnInit() {
    // Suscripción en tiempo real (cache-first + servidor)
    this.startAppointmentsSubscription();
    // Fallback inicial por si la suscripción tarda
    try { await this.loadCitas(); } catch {}
  }

  ngOnDestroy(): void {
    try { this.unsubscribeAppointments?.(); } catch {}
  }

  async loadCitas() {
    this.loading = true;
    try {
      this.citas = await this.dataService.getAllAppointments();
      
      // Cargar información del usuario para cada cita
      for (let cita of this.citas) {
        try {
          const userProfile = await this.dataService.getUserProfile(cita.uid);
          if (userProfile) {
            cita.userName = userProfile.name;
            cita.userEmail = userProfile.email;
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      
      // Ordenar por fecha más reciente
      this.citas.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
      
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Evitar molestar con errores cuando no hay conexión: se verá el estado offline con banner y/o mensaje
      if (this.onlineService.isOnline) {
        await this.presentToast('Error al cargar las citas', 'danger');
      }
    }
    this.loading = false;
  }

  private startAppointmentsSubscription() {
    this.loading = true;
    const colRef = collection(db, 'appointments');
    // includeMetadataChanges emite primero caché y luego servidor
    this.unsubscribeAppointments = onSnapshot(
      colRef,
      { includeMetadataChanges: true },
      async (snapshot) => {
        try {
          const base = snapshot.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data(), _pendingSync: d.metadata.hasPendingWrites } as any));
          // Enriquecer con datos de usuario
          const enriched = await Promise.all(base.map(async (cita: any) => {
            try {
              const profile = await this.dataService.getUserProfile(cita.uid);
              if (profile) {
                cita.userName = profile.name;
                cita.userEmail = profile.email;
              }
            } catch {}
            return cita;
          }));
          // Ordenar por fecha más reciente
          enriched.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return (dateB as any) - (dateA as any);
          });
          this.citas = enriched;
        } catch (e) {
          console.error('Error procesando snapshot de citas:', e);
          if (this.onlineService.isOnline) {
            await this.presentToast('Error al actualizar la lista de citas', 'danger');
          }
        } finally {
          this.loading = false;
        }
      },
      async (error) => {
        console.error('Error en onSnapshot de citas:', error);
        if (this.onlineService.isOnline) {
          await this.presentToast('Error al escuchar cambios de citas', 'danger');
        }
        this.loading = false;
      }
    );
  }

  async aprobar(cita: Cita) {
    if (!this.onlineService.isOnline) {
      await this.presentToast('Se requiere conexión para gestionar citas', 'warning');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Aprobación',
      message: `¿Estás seguro de aprobar la cita de ${cita.userName || 'este usuario'}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aprobar',
          role: 'confirm',
          handler: async () => {
            try {
              await this.dataService.actualizarEstadoCita(cita.id, this.ESTADOS.APROBADA);
              cita.status = this.ESTADOS.APROBADA;
              await this.presentToast(`Cita de ${cita.userName || 'usuario'} aprobada`, 'success');
            } catch (error) {
              console.error('Error approving appointment:', error);
              await this.presentToast('Error al aprobar la cita', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async rechazar(cita: Cita) {
    if (!this.onlineService.isOnline) {
      await this.presentToast('Se requiere conexión para gestionar citas', 'warning');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Rechazo',
      message: `¿Estás seguro de rechazar la cita de ${cita.userName || 'este usuario'}? Esta acción eliminará la cita permanentemente.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Rechazar',
          role: 'confirm',
          handler: async () => {
            try {
              // Eliminar la cita del storage en lugar de solo cambiar el estado
              await this.dataService.deleteAppointment(cita.id);
              // Remover de la lista local
              this.citas = this.citas.filter(c => c.id !== cita.id);
              await this.presentToast(`Cita de ${cita.userName || 'usuario'} rechazada y eliminada`, 'warning');
            } catch (error) {
              console.error('Error rejecting appointment:', error);
              await this.presentToast('Error al rechazar la cita', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async completar(cita: Cita) {
    if (!this.onlineService.isOnline) {
      await this.presentToast('Se requiere conexión para gestionar citas', 'warning');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Completación',
      message: `¿Estás seguro de marcar como completada la cita de ${cita.userName || 'este usuario'}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Completar',
          role: 'confirm',
          handler: async () => {
            try {
              await this.dataService.actualizarEstadoCita(cita.id, this.ESTADOS.COMPLETADA);
              cita.status = this.ESTADOS.COMPLETADA;
              await this.presentToast(`Cita de ${cita.userName || 'usuario'} marcada como completada`, 'success');
            } catch (error) {
              console.error('Error completing appointment:', error);
              await this.presentToast('Error al completar la cita', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminar(cita: Cita) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de eliminar la cita de ${cita.userName || 'este usuario'}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: async () => {
            try {
              await this.dataService.deleteAppointment(cita.id);
              this.citas = this.citas.filter(c => c.id !== cita.id);
              await this.presentToast('Cita eliminada exitosamente', 'success');
            } catch (error) {
              console.error('Error deleting appointment:', error);
              await this.presentToast('Error al eliminar la cita', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(message: string, color: string = 'success', duration = 3000) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration,
      position: 'bottom'
    });
    await toast.present();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case this.ESTADOS.APROBADA:
        return 'success';
      case this.ESTADOS.PENDIENTE:
        return 'warning';
      case this.ESTADOS.RECHAZADA:
        return 'danger';
      case this.ESTADOS.COMPLETADA:
        return 'medium';
      default:
        return 'medium';
    }
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleDateString('es-MX');
    }
    return new Date(date).toLocaleDateString('es-MX');
  }

  getCitasPendientes(): number {
    return this.citas.filter(c => c.status === this.ESTADOS.PENDIENTE).length;
  }

  getCitasAprobadas(): number {
    return this.citas.filter(c => c.status === this.ESTADOS.APROBADA).length;
  }

  getCitasCompletadas(): number {
    return this.citas.filter(c => c.status === this.ESTADOS.COMPLETADA).length;
  }
}


