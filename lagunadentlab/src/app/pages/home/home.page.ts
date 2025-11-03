import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  ribbonOutline,
  flashOutline,
  peopleOutline,
  bulbOutline,
  checkmarkCircle,
  arrowForwardOutline,
  star
} from 'ionicons/icons';

import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonImg,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    NavbarComponent,
    FooterComponent
  ]
})
export class HomePage {
  constructor(private router: Router) {
    addIcons({
      ribbonOutline,
      flashOutline,
      peopleOutline,
      bulbOutline,
      checkmarkCircle,
      arrowForwardOutline,
      star
    });
  }

  // Método para navegar a solicitud de servicios
  navegarASolicitudServicios() {
    this.router.navigate(['/appointment']);
  }

  // Método para navegar a nosotros
  navegarANosotros() {
    this.router.navigate(['/about']);
  }

  // Método para navegar a servicios
  navegarAServicios() {
    this.router.navigate(['/services']);
  }

  // Método para navegar a contacto
  navegarAContacto() {
    this.router.navigate(['/contact']);
  }
}