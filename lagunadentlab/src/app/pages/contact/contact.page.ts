import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    NavbarComponent,
    FooterComponent
  ]
})
export class ContactPage implements OnInit {
  constructor() {
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
  }

  // Método para abrir WhatsApp
  abrirWhatsApp() {
    const numeroWhatsApp = '8701498192';
    const mensaje = 'Hola, me interesa conocer más sobre sus servicios de laboratorio dental.';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }
}
