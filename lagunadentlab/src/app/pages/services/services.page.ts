import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonButton, IonIcon, IonList, IonItem, IonLabel} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import {layersOutline, checkmarkCircleOutline, ribbonOutline, desktopOutline,
  scanOutline, brushOutline, cubeOutline,checkmarkDoneOutline, arrowForwardOutline, hardwareChipOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonButton, IonIcon, IonList, IonItem, IonLabel, NavbarComponent, FooterComponent, RouterLink]
})
export class ServicesPage implements OnInit {

  constructor() {
    addIcons({layersOutline,checkmarkCircleOutline,arrowForwardOutline,ribbonOutline,desktopOutline,scanOutline,brushOutline,cubeOutline,checkmarkDoneOutline,hardwareChipOutline});
   }

  ngOnInit() {
  }

}



