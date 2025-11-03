import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonIcon, IonInput, IonButton, ToastController } from '@ionic/angular/standalone';
import {mailOutline} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';




@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.page.html',
  styleUrls: ['./forgotpassword.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, ReactiveFormsModule, IonIcon, NavbarComponent, RouterModule]
})
export class ForgotpasswordPage  {

  form: FormGroup;
  loading = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {
    addIcons({
      mailOutline
    });
    
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }


  ngOnInit() {
  }

  async presentToast(message: string, color: string = 'success', duration = 3000) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration,
      position: 'bottom'
    });
    await toast.present();
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.presentToast('Ingresa un correo válido', 'danger');
      return;
    }

    this.loading = true;
    const { email } = this.form.value;

    try {
      await this.authService.resetPassword(email);
      await this.presentToast('Correo de recuperación enviado. Revisa tu bandeja de entrada.', 'success');
      this.form.reset();
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (err: any) {
      let errorMessage = 'Error al enviar correo de recuperación';
      if (err.message === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta registrada con este correo';
      }
      await this.presentToast(errorMessage, 'danger');
    }
    this.loading = false;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
