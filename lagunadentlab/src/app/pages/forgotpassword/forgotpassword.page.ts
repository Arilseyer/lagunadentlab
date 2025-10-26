import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonIcon, IonInput, IonButton } from '@ionic/angular/standalone';
import {mailOutline} from 'ionicons/icons';
import { addIcons } from 'ionicons';




@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.page.html',
  styleUrls: ['./forgotpassword.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule,IonIcon, IonInput, IonButton]
})
export class ForgotpasswordPage  {

 constructor() {

    addIcons
    ({
      mailOutline
    })
   }


  ngOnInit() {
  }

}
