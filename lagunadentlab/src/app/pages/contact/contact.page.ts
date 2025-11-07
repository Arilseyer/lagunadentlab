import { Component, OnInit } from '@angular/core';
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
import { OwnerEmailService } from '../../services/owner-email.service';

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
export class ContactPage implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private onlineService: OnlineService,
    private dataService: DataService,
    private ownerEmail: OwnerEmailService
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
      if (wasOffline) {
        await this.presentToast('Mensaje guardado sin conexión, se enviará al reconectar', 'warning');
      } else {
        await this.presentToast('Mensaje enviado correctamente.', 'success');
      }
      // Enviar copia al dueño por EmailJS (no bloqueante)
      try { await this.ownerEmail.sendOwnerContact(payload); } catch (e) { console.warn('EmailJS contacto (owner) fallo:', e); }
      this.form.reset();
    } catch (err) {
      console.error('Error guardando mensaje de contacto:', err);
      if (!this.onlineService.isOnline) {
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
