import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonCard, IonCardHeader, 
         IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, 
         IonLabel, IonInput, IonRouterLink, IonHeader, IonToolbar, IonTitle} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  personAddOutline,
  arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonRouterLink,
    IonHeader,
    IonToolbar,
    IonTitle]
})
export class RegisterPage implements OnInit {

  constructor() {
      addIcons({personAddOutline, arrowBackOutline}); }

  ngOnInit() {
  }

}

