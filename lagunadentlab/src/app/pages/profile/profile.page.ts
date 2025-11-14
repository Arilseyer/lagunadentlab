/**
 * Página de perfil de usuario.
 * Permite ver y editar datos personales, con validación y confirmación antes de guardar.
 * Muestra citas del usuario y permite cerrar sesión.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { 
  mailOutline, 
  personOutline, 
  callOutline, 
  calendarOutline,
  createOutline,
  informationCircleOutline,
  receiptOutline,
  locationOutline,
  logOutOutline,
  saveOutline,
  closeOutline
} from 'ionicons/icons';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LottieLoaderComponent } from '../../components/lottie-loader/lottie-loader.component';
import { AuthService } from '../../services/auth.service';
import { DataService, CITA_ESTADOS } from '../../services/data.service';
import { ToastController, AlertController } from '@ionic/angular';
import { OnlineService } from '../../services/online.service';
import { PendingProfileService } from '../../services/pending-profile.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from 'src/environments/firebase';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IonContent,
    IonIcon,
    IonItem,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    IonInput,
    IonButton,
    NavbarComponent,
    TranslatePipe
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit, ViewWillEnter, OnDestroy {
  selectedTab: string = 'info';
  userProfile: any = null;
  currentUser: any = null;
  isEditing: boolean = false;
  editForm: FormGroup;
  loading: boolean = false;
  appointments: any[] = [];
  private unsubscribeAppointments?: () => void;
  private unsubscribeProfile?: () => void;
  private onlineSub?: Subscription;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private onlineService: OnlineService,
    private pendingProfileService: PendingProfileService
  ) { 
    addIcons({
      mailOutline,
      personOutline,
      callOutline,
      calendarOutline,
      createOutline,
      informationCircleOutline,
      receiptOutline,
      locationOutline,
      logOutOutline,
      saveOutline,
      closeOutline
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    });
  }

  async ngOnInit() {
    // Redirigir si la sesión se cierra mientras estás en esta página
    this.authService.user$.subscribe(user => {
      if (!user) {
        // Limpiar estado local y salir del perfil
        this.currentUser = null;
        this.userProfile = null;
        this.appointments = [];
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    });

    // Suscribirse a cambios de conexión para mostrar toasts específicos de la página
    this.onlineSub = this.onlineService.isOnline$.subscribe(async (isOnline) => {
      if (!isOnline) {
        await this.presentToast(
          'Estás sin conexión: los cambios en tu perfil no se guardarán hasta reconectar',
          'warning',
          4000
        );
      }
    });

    // Verificar si hay cambios pendientes al iniciar
    if (this.pendingProfileService.hasPendingUpdate()) {
      await this.presentToast(
        'Tienes cambios pendientes que se sincronizarán al reconectar',
        'warning',
        4000
      );
    }

    await this.loadUserData();
  }

  async ionViewWillEnter() {
    // Se ejecuta cada vez que entras a la página, incluso si ya estaba creada
    await this.loadUserData();
  }

  async loadUserData() {
    this.loading = true;
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      // Iniciar suscripciones en tiempo real (cache-first + servidor)
      this.startRealtimeSubscriptions(this.currentUser.uid);
      try {
        this.userProfile = await this.dataService.getUserProfile(this.currentUser.uid);
        if (this.userProfile) {
          this.editForm.patchValue({
            name: this.userProfile.name || '',
            phone: this.userProfile.phone || ''
          });
        }
        
        // Cargar citas del usuario y normalizar estado para mostrar
        const citas = await this.dataService.getAppointmentsByUser(this.currentUser.uid);
        this.appointments = citas.map(appt => {
          let status = appt.status;
          if (!status || status === 'Pendiente') {
            status = CITA_ESTADOS.PENDIENTE;
          } else if (status === 'Aprobada') {
            status = CITA_ESTADOS.APROBADA;
          } else if (status === 'Rechazada') {
            status = CITA_ESTADOS.RECHAZADA;
          } else if (status === 'Completada' || status === 'Completa') {
            status = CITA_ESTADOS.COMPLETADA;
          }
          return { ...appt, status };
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        // Si no hay conexión, evita mostrar toast de error; el banner global ya indica el estado
        if (this.onlineService.isOnline) {
          await this.presentToast('Error al cargar datos del usuario', 'danger');
        }
      }
    }
    this.loading = false;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Resetear formulario si se cancela
      this.editForm.patchValue({
        name: this.userProfile?.name || '',
        phone: this.userProfile?.phone || ''
      });
    } else {
      // Al iniciar edición, cargar cambios pendientes si existen
      const pending = this.pendingProfileService.getPendingUpdate();
      if (pending && pending.uid === this.currentUser?.uid) {
        this.editForm.patchValue({
          name: pending.name,
          phone: pending.phone
        });
        this.presentToast(
          'Cambios pendientes restaurados',
          'info',
          2000
        );
      }
    }
  }

  async saveProfile() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      await this.presentToast('Completa todos los campos correctamente', 'danger');
      return;
    }

    const { name, phone } = this.editForm.value;

    // Detectar si está offline ANTES de mostrar el alert para evitar que se trabe
    const wasOffline = this.onlineService.wasRecentlyOffline(2000);
    const isNetworkReachable = await this.onlineService.isNetworkReachable(1200);
    const isOffline = wasOffline || !navigator.onLine || !isNetworkReachable;

    if (isOffline) {
      // Guardar temporalmente en localStorage
      this.pendingProfileService.savePendingUpdate(
        this.currentUser.uid,
        name,
        phone,
        this.currentUser.email
      );

      // Mostrar toast inmediato sin alert
      await this.presentToast(
        'Cambios guardados temporalmente. Se sincronizarán al reconectar',
        'warning',
        4000
      );

      // Cerrar modo edición para que el usuario vea que se "guardó"
      this.isEditing = false;
      return;
    }

    const alert = await this.alertCtrl.create({
      header: '¿Guardar cambios?',
      message: '¿Estás seguro de que deseas guardar los cambios en tu perfil?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, guardar',
          handler: async () => {
            this.loading = true;
            try {
              await this.dataService.saveUserProfile(this.currentUser.uid, {
                name,
                phone,
                email: this.currentUser.email,
                updatedAt: new Date()
              });
              this.userProfile = await this.dataService.getUserProfile(this.currentUser.uid);
              this.isEditing = false;
              
              // Limpiar cambios pendientes si existían
              this.pendingProfileService.clearPendingUpdate();
              
              await this.presentToast('Perfil actualizado correctamente', 'success');
            } catch (error) {
              console.error('Error saving profile:', error);
              await this.presentToast('Error al guardar el perfil', 'danger');
            }
            this.loading = false;
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    try {
      await this.authService.logout();
      // Limpiar estado y navegar reemplazando historial para evitar back al perfil
      this.currentUser = null;
      this.userProfile = null;
      this.appointments = [];
      await this.presentToast('Sesión cerrada exitosamente', 'success');
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error) {
      console.error('Error logging out:', error);
      await this.presentToast('Error al cerrar sesión', 'danger');
    }
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

  segmentChanged(event: CustomEvent) {
    this.selectedTab = event.detail.value;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case CITA_ESTADOS.APROBADA:
        return 'success';
      case CITA_ESTADOS.PENDIENTE:
        return 'warning';
      case CITA_ESTADOS.RECHAZADA:
        return 'danger';
      case CITA_ESTADOS.COMPLETADA:
        return 'medium';
      default:
        return 'medium';
    }
  }

  formatDate(date: any): string {
    if (date && date.toDate) {
      return date.toDate().toLocaleDateString('es-MX');
    }
    return date || 'N/A';
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    if (timeStr.includes('T')) {
      return new Date(timeStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  ngOnDestroy(): void {
    try { this.unsubscribeAppointments?.(); } catch {}
    try { this.unsubscribeProfile?.(); } catch {}
    try { this.onlineSub?.unsubscribe(); } catch {}
  }

  private startRealtimeSubscriptions(uid: string) {
    // Limpiar suscripciones previas para evitar duplicados
    try { this.unsubscribeAppointments?.(); } catch {}
    try { this.unsubscribeProfile?.(); } catch {}

    // Perfil del usuario
    const userRef = doc(db, 'users', uid);
    this.unsubscribeProfile = onSnapshot(
      userRef,
      { includeMetadataChanges: true },
      {
        next: (snap) => {
          if (snap.exists()) {
            this.userProfile = snap.data();
            this.editForm.patchValue({
              name: this.userProfile?.name || '',
              phone: this.userProfile?.phone || ''
            });
          }
        },
        error: (error: unknown) => {
          console.error('Error en onSnapshot de perfil:', error);
          if (this.onlineService.isOnline) {
            this.presentToast('Error al actualizar el perfil', 'danger');
          }
        }
      }
    );

    // Citas del usuario
    const apptQuery = query(collection(db, 'appointments'), where('uid', '==', uid));
    this.unsubscribeAppointments = onSnapshot(
      apptQuery,
      { includeMetadataChanges: true },
      {
        next: (snap) => {
          const citas = snap.docs.map(d => ({ id: d.id, ...d.data(), _pendingSync: d.metadata.hasPendingWrites } as any));
          this.appointments = citas.map(appt => {
            let status = appt.status;
            if (!status || status === 'Pendiente') {
              status = CITA_ESTADOS.PENDIENTE;
            } else if (status === 'Aprobada') {
              status = CITA_ESTADOS.APROBADA;
            } else if (status === 'Rechazada') {
              status = CITA_ESTADOS.RECHAZADA;
            } else if (status === 'Completada' || status === 'Completa') {
              status = CITA_ESTADOS.COMPLETADA;
            }
            return { ...appt, status };
          });
        },
        error: (error: unknown) => {
          console.error('Error en onSnapshot de citas del usuario:', error);
          if (this.onlineService.isOnline) {
            this.presentToast('Error al actualizar las citas', 'danger');
          }
        }
      }
    );
  }
}

