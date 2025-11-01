import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonIcon, IonInput, IonButton } from '@ionic/angular/standalone';
import {mailOutline} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavbarComponent } from '../../components/navbar/navbar.component';




@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.page.html',
  styleUrls: ['./forgotpassword.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule,IonIcon, IonInput, IonButton, NavbarComponent, RouterModule]
})
export class ForgotpasswordPage  {

 constructor(private router: Router) {

    addIcons
    ({
      mailOutline
    })
   }


  ngOnInit() {
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
