/**
 * Página de registro de usuario.
 * Valida el formulario, crea el usuario en Auth y guarda el perfil en Firestore.
 * Envía correo de verificación y cierra sesión tras el registro.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { sendEmailVerification } from 'firebase/auth';
import { ToastController } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personAddOutline,
  arrowBackOutline,
  eye,
  eyeOff
} from 'ionicons/icons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { OnlineService } from '../../services/online.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    IonicModule,
    NavbarComponent]
})
export class RegisterPage {
  form: FormGroup;
  loading = false;

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private toastCtrl: ToastController,
    private router: Router,
    private authService: AuthService,
    private onlineService: OnlineService,
  ) {
    addIcons({ personAddOutline, arrowBackOutline, eye, eyeOff });

    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
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
      if (this.form.errors && this.form.errors['passwordsMismatch']) {
        await this.presentToast('Las contraseñas no coinciden', 'danger');
      } else {
        await this.presentToast('Completa todos los campos correctamente.', 'danger');
      }
      return;
    }

    // Requiere conexión activa
    if (!this.onlineService.isOnline) {
      await this.presentToast('Se necesita conexión a internet para este proceso', 'warning');
      return;
    }

    this.loading = true;
    try {
      const { fullName, email, phone, password } = this.form.value;
      const cred = await this.authService.register(email, password);

      if (cred.user) {
        await sendEmailVerification(cred.user);

        try {
          await this.dataService.saveUserProfile(cred.user.uid, {
            name: fullName,
            email,
            phone,
            isAdmin: false,
            createdAt: new Date()
          });
          this.form.reset();
        } catch (firestoreError: any) {
          console.error('Error guardando perfil (users/create):', firestoreError);
          const errorMsg = firestoreError?.message || firestoreError?.code || 'Error desconocido';
          await this.presentToast(`Error guardando perfil: ${errorMsg}`, 'danger');
        }

        await this.authService.logout();
        await this.presentToast('Te enviamos un correo de verificación. Verifica tu email antes de iniciar sesión.', 'warning');
        this.router.navigateByUrl('/login');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        await this.presentToast('Este correo ya está registrado', 'danger');
        this.loading = false;
        return;
      }
      await this.presentToast(err.message || 'Error al registrar', 'danger');
    }
    this.loading = false;
  }

  // Exponer observable para deshabilitar botón cuando no hay conexión
  get isOnline$() {
    return this.onlineService.isOnline$;
  }
}
