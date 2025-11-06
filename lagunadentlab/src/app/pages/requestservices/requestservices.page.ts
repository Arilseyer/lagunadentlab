import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavController, IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { OnlineService } from '../../services/online.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { 
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  documentTextOutline,
  sendOutline,
  locationOutline,
  timeOutline,
  callOutline,
  logoWhatsapp,
  logoFacebook,
  mailOutline, calendarOutline, arrowForwardOutline } from 'ionicons/icons';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-requestservices',
  templateUrl: './requestservices.page.html',
  styleUrls: ['./requestservices.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    IonContent,
    IonIcon,
    FooterComponent,
    NavbarComponent
  ]
})
export class RequestservicesPage implements OnInit, OnDestroy {
  form: FormGroup;
  serviceTypes: string[] = [
    'Prótesis Flexible Bilateral',
    'Prótesis Flexible Unilateral',
    'Placas Parcial Acrílica',
    'Placa Total Acrílica',
    'Placa Removible Metal Acrílico',
    'Coronilla Total de Metal',
    'Coronilla 3/4',
    'Corona Total de Metal',
    'Corona de Porcelana',
    'Corona de Zirconia',
    'Incrustación Corona Carilla Disilicato',
    'Escáner Dental'
  ];

  availableHours: { value: string, label: string }[] = [];
  minDate: string = '';
  minTime: string = '09:00';
  maxTime: string = '18:00';
  isLoggedIn = false;
  loading = false;
  private userSubscription?: Subscription;

  customPopoverOptions = {
    header: 'Tipo de servicio',
    subHeader: 'Selecciona el servicio que necesitas',
    cssClass: 'custom-popover select-dropdown',
    showBackdrop: true,
    backdropDismiss: true
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private dataService: DataService,
    private authService: AuthService,
    private onlineService: OnlineService
  ) {
    // Registrar iconos
    addIcons({documentTextOutline,calendarOutline,timeOutline,arrowForwardOutline,sendOutline,locationOutline,callOutline,logoWhatsapp,logoFacebook,mailOutline});

    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      serviceType: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit() {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // Generate initial hours for today
    this.updateAvailableHours(today.getDay());

    // Auto-fill and lock user info if logged in
    this.userSubscription = this.authService.user$.subscribe(async (user) => {
      if (user) {
        this.isLoggedIn = true;
        try {
          const profile = await this.dataService.getUserProfile(user.uid);
          const name = profile?.name || user.displayName || '';
          const phone = profile?.phone || user.phoneNumber || '';
          const email = user.email || '';
          this.form.patchValue({ name, email, phone });
        } catch {
          const name = user.displayName || '';
          const phone = user.phoneNumber || '';
          const email = user.email || '';
          this.form.patchValue({ name, email, phone });
        }
      } else {
        this.isLoggedIn = false;
        this.form.patchValue({ name: '', email: '', phone: '' });
      }
    });
  }

  ngOnDestroy() {
    // Limpiar suscripción para evitar memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Cambia el set de horas cuando cambia la fecha
  onDateChange(event: any) {
    const date = event?.detail?.value;
    if (!date) return;
    const dayOfWeek = new Date(date).getDay();
    this.updateAvailableHours(dayOfWeek);
  }

  // Define horas por día: L-V 09-18, Sábado 09-14, Domingo sin citas
  private updateAvailableHours(dayOfWeek: number) {
    let start = 9, end = 18;
    if (dayOfWeek === 6) {
      end = 14; // Sábado
    } else if (dayOfWeek === 0) {
      this.availableHours = []; // Domingo
      return;
    }
    const hours: { value: string, label: string }[] = [];
    for (let h = start; h <= end; h++) {
      const value = `${h.toString().padStart(2, '0')}:00`;
      hours.push({ value, label: this.formatHour12h(h, 0) });
    }
    this.availableHours = hours;
  }

  private formatHour12h(hour: number, minute: number): string {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  async onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      await this.presentToast('Completa todos los campos correctamente.', 'danger');
      return;
    }

    // Debe estar autenticado
    const user = this.authService.getCurrentUser();
    if (!user) {
      await this.presentToast('Debes iniciar sesión para solicitar un servicio.', 'danger');
      return;
    }

    this.loading = true;
    const { date, time } = this.form.value;

    // Validaciones de fecha/horario
    // Parsear fecha correctamente para evitar problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day); // month es 0-indexed
    const dayOfWeek = selectedDateObj.getDay();
    
    let min = '09:00', max = '18:00';
    if (dayOfWeek === 6) max = '14:00';
    if (dayOfWeek === 0) {
      await this.presentToast('No se pueden agendar citas en domingo.', 'danger');
      this.loading = false;
      return;
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0,0,0,0);
    
    if (selectedDate < today) {
      await this.presentToast('No puedes agendar citas en fechas pasadas.', 'danger');
      this.loading = false;
      return;
    }
    
    const selectedTime = (typeof time === 'string' && time.length > 5) ? time.substring(11,16) : time; // HH:mm
    if (selectedTime < min || selectedTime > max) {
      await this.presentToast(`El horario permitido es de ${min} a ${max}.`, 'danger');
      this.loading = false;
      return;
    }

    // Construir y guardar la cita
    const appointment = {
      ...this.form.value,
      status: 'Pendiente',
      uid: user.uid,
      createdAt: new Date()
    };
    try {
      const wasOffline = !this.onlineService.isOnline;
      await this.dataService.saveAppointment(appointment);
      if (wasOffline) {
        await this.presentToast('Solicitud guardada sin conexión, se enviará al reconectar', 'warning');
      } else {
        await this.presentToast('Cita solicitada correctamente.', 'success');
      }
      // Navegar al perfil para ver la cita recién creada (aparece también con escritura local offline)
      this.router.navigate(['/profile']);
    } catch (err) {
      console.error('Error al guardar la cita (appointments/create):', err);
      // Si hay error pero estamos offline, aún podría quedar encolado; informa de forma no bloqueante
      if (!this.onlineService.isOnline) {
        await this.presentToast('Solicitud guardada sin conexión, se enviará al reconectar', 'warning');
        this.router.navigate(['/profile']);
      } else {
        await this.presentToast('Error al guardar la cita. Intenta de nuevo.', 'danger');
      }
    }
    this.loading = false;
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2500, color, position: 'bottom' });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
