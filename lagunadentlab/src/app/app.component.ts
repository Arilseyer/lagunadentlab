import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonRouterOutlet, IonButtons, IonContent, IonHeader, IonMenu, IonMenuButton, IonTitle, IonToolbar,
  IonItem, IonLabel, IonList, IonFooter, IonButton,
  IonIcon, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import {globeOutline, sunnyOutline, personCircleOutline} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { IonImg } from '@ionic/angular';
import { addIcons } from 'ionicons';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    IonRouterOutlet, IonButtons, IonContent, IonHeader, IonMenu, IonMenuButton, IonTitle, IonToolbar,
    IonItem, IonLabel, IonList, IonFooter, IonButton,RouterLink, CommonModule, FormsModule,IonIcon,
    IonGrid,IonRow,IonCol, 
  ]
})
export class AppComponent implements OnInit {
  
  
toggleLanguage() {
  console.log('Cambiando idioma...');
  // Aquí podrías implementar un servicio de traducción o alternar entre ES/EN
}

toggleDarkMode() {
  document.body.classList.toggle('dark');
}

  constructor() {
    
    document.body.classList.remove('dark');

    addIcons({
      globeOutline,
      sunnyOutline,
      personCircleOutline
    })
    
  }

  ngOnInit() {
  }

}



