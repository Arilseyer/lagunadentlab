import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
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
  IonRouterLink
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personAddOutline,
  arrowBackOutline,
  eye,
  eyeOff
} from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';

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
    IonIcon,
    NavbarComponent]
})
export class RegisterPage implements OnInit {
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    addIcons({personAddOutline, arrowBackOutline, eye, eyeOff});
  }

  ngOnInit() {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
