import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonTextarea,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  sendOutline, 
  locationOutline, 
  timeOutline, 
  callOutline,
  logoWhatsapp,
  logoFacebook,
  mailOutline
} from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ToastController } from '@ionic/angular';
import { OnlineService } from '../../services/online.service';
import { DataService } from '../../services/data.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { OwnerEmailService} from '../../services/owner-email.service';
import { Subscription } from 'rxjs';
import { PendingEmailsService } from '../../services/pending-emails.service';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    NavbarComponent,
    FooterComponent,
    TranslatePipe
  ]
})
export class ContactPage implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  private onlineSub?: Subscription;
  private offlineToastShown = false;

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private onlineService: OnlineService,
    private dataService: DataService,
    private pendingEmailsService: PendingEmailsService,
    private emailService: EmailService
  ) {
    addIcons({
      sendOutline,
      locationOutline,
      timeOutline,
      callOutline,
      logoWhatsapp,
      logoFacebook,
      mailOutline
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Avisos de conexión/desconexión mientras estás en esta página
    this.onlineSub = this.onlineService.isOnline$.subscribe(async (isOnline) => {
      if (!isOnline) {
        if (!this.offlineToastShown) {
          await this.presentToast('Estás sin conexión: el mensaje se enviará al reconectar.', 'warning');
          this.offlineToastShown = true;
        }
      } else {
        if (this.offlineToastShown) {
          await this.presentToast('Conexión recuperada: tus datos se sincronizarán automáticamente.', 'success');
        }
        this.offlineToastShown = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.onlineSub) this.onlineSub.unsubscribe();
  }

  // Método para abrir WhatsApp
  abrirWhatsApp() {
    const numeroWhatsApp = '8701498192';
    const mensaje = 'Hola, me interesa conocer más sobre sus servicios de laboratorio dental.';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  async onSubmit() {
    if (!this.form || this.form.invalid) {
      this.form?.markAllAsTouched();
      await this.presentToast('Completa todos los campos correctamente.', 'danger');
      return;
    }

    this.loading = true;
    const { name, email, phone, message } = this.form.value;
    const payload = {
      name,
      email,
      phone,
      message,
      createdAt: new Date(),
      status: 'nuevo'
    };

    try {
      const wasOffline = !this.onlineService.isOnline;
      await this.dataService.saveContactMessage(payload);
      
      // Enviar email o encolarlo si está offline
      if (wasOffline) {
        // Encolar para enviar cuando recupere conexión
        this.pendingEmailsService.enqueueContactEmail(payload);
        console.log('[Contact] Email encolado para envío posterior');
        await this.presentToast('Mensaje guardado sin conexión, se enviará al reconectar', 'warning');
      } else {
        // Intentar enviar inmediatamente si hay conexión
        if (this.emailService.isConfigured()) {
          try {
            await this.emailService.sendContactMessage(payload);
            console.log('[Contact] Email enviado correctamente');
            await this.presentToast('Mensaje enviado correctamente.', 'success');
          } catch (emailError) {
            console.error('[Contact] Error enviando email:', emailError);
            // Si falla, encolar para reintento
            this.pendingEmailsService.enqueueContactEmail(payload);
            await this.presentToast('Mensaje guardado, pero el email se enviará más tarde.', 'warning');
          }
        } else {
          await this.presentToast('Mensaje enviado correctamente.', 'success');
        }
      }
      
      this.form.reset();
    } catch (err) {
      console.error('Error guardando mensaje de contacto:', err);
      if (!this.onlineService.isOnline) {
        // Ya se encoló o se mostrará el toast de offline
        this.pendingEmailsService.enqueueContactEmail(payload);
        await this.presentToast('Mensaje guardado sin conexión, se enviará al reconectar', 'warning');
      } else {
        await this.presentToast('Error al enviar el mensaje. Intenta de nuevo.', 'danger');
      }
    }
    this.loading = false;
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2500, color, position: 'bottom' });
    await toast.present();
  }
}
