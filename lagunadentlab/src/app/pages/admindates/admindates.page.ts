import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { checkmarkCircleOutline, closeCircleOutline, timeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface Cita {
  id: number;
  usuario: string;
  email: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Completada';
}

@Component({
  selector: 'app-admindates',
  templateUrl: './admindates.page.html',
  styleUrls: ['./admindates.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonCard, IonCardContent, CommonModule, FormsModule, NavbarComponent, FooterComponent]
})
export class AdmindatesPage implements OnInit {

  citas: Cita[] = [
    {
      id: 1,
      usuario: 'María García',
      email: 'maria@example.com',
      servicio: 'Coronas de Porcelana',
      fecha: '2025-10-20',
      hora: '10:00',
      estado: 'Pendiente'
    },
    {
      id: 2,
      usuario: 'Juan Pérez',
      email: 'juan@example.com',
      servicio: 'Prótesis Dental',
      fecha: '2025-10-21',
      hora: '14:30',
      estado: 'Aprobada'
    },
    {
      id: 3,
      usuario: 'Ana Rodríguez',
      email: 'ana@example.com',
      servicio: 'Implantes Dentales',
      fecha: '2025-10-22',
      hora: '09:00',
      estado: 'Pendiente'
    },
    {
      id: 4,
      usuario: 'Carlos López',
      email: 'carlos@example.com',
      servicio: 'Ortodoncia',
      fecha: '2025-10-19',
      hora: '11:30',
      estado: 'Completada'
    }
  ];

  constructor() { 
    addIcons({ checkmarkCircleOutline, closeCircleOutline, timeOutline });
  }

  ngOnInit() {
  }

  aprobar(cita: Cita) {
    // console.log('Aprobando cita de:', cita.usuario);
    cita.estado = 'Aprobada';
  }

  rechazar(cita: Cita) {
    // console.log('Rechazando cita de:', cita.usuario);
    cita.estado = 'Rechazada';
  }

  completar(cita: Cita) {
    // console.log('Completando cita de:', cita.usuario);
    cita.estado = 'Completada';
  }
}


