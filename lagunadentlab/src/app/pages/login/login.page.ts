import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonMenu, IonButton,IonInput, IonItem,
  IonInputPasswordToggle, IonIcon, 
 } from '@ionic/angular/standalone';
 import { RouterLink } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { addIcons } from 'ionicons';
import {logIn } from 'ionicons/icons';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonMenu, IonButton
    , IonInput, IonItem,IonInputPasswordToggle,  IonButton, IonContent, IonHeader, IonTitle, IonToolbar,
    RouterLink, IonIcon, 
  ]
})
export class LoginPage implements OnInit {
  
  constructor() { 

    addIcons({
      logIn,
    });

  }

  ngOnInit() {
  }

}
