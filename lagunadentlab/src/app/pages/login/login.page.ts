/*
Página de login.
Valida el formulario, muestra mensajes de error y deshabilita el botón durante el proceso.
Si el usuario no ha verificado su email, muestra advertencia y cierra sesión.
*/
import { getAuth } from 'firebase/auth';

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { RouterLink, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logInOutline, eye, eyeOff } from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NavbarComponent,
    IonicModule
  ]
})
export class LoginPage {

  showPassword = false;
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private data: DataService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({
      logInOutline,
      eye,
      eyeOff
    });

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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
      await this.presentToast('Completa todos los campos correctamente.', 'danger');
      return;
    }

    this.loading = true;
    const { email, password } = this.form.value;

    try {
      await this.authService.login(email, password);
      const authInstance = getAuth();
      const user = authInstance.currentUser;
      if (user && !user.emailVerified) {
        await this.presentToast('Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.', 'warning');
        await this.authService.logout();
        this.loading = false;
        return;
      }
      // Guardar perfil en Firestore solo si no existe y el email está verificado
      if (user && user.emailVerified) {
        const uid = user.uid;
        const profile = await this.data.getUserProfile(uid);
        if (!profile) {
          try {
            await this.data.saveUserProfile(uid, {
              name: user.displayName || '',
              email: user.email,
              phone: user.phoneNumber || '',
              isAdmin: false,
              createdAt: new Date()
            });
          } catch (e) {
            console.error('Error creando perfil tras login (users/create):', e);
          }
        }
      }
      await this.presentToast('¡Login exitoso!', 'success');
      this.router.navigate(['/profile']);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        await this.presentToast('Usuario o contraseña incorrectos', 'danger');
      } else {
        await this.presentToast(err.message || 'Error al iniciar sesión', 'danger');
      }
    }
    this.loading = false;
  }
}