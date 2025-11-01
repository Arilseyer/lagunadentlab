import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  mailOutline, 
  personOutline, 
  callOutline, 
  calendarOutline,
  createOutline,
  informationCircleOutline,
  receiptOutline,
  locationOutline
} from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonItem,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonItem,
    IonInput,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    NavbarComponent
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  selectedTab: string = 'info';

  constructor() { 
    addIcons({
      mailOutline,
      personOutline,
      callOutline,
      calendarOutline,
      createOutline,
      informationCircleOutline,
      receiptOutline,
      locationOutline
    });
  }

  ngOnInit() {
  }

  segmentChanged(event: CustomEvent) {
    this.selectedTab = event.detail.value;
  }
}

