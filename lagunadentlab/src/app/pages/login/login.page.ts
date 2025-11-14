/*
Página de login.
Valida el formulario, muestra mensajes de error y deshabilita el botón durante el proceso.
Si el usuario no ha verificado su email, muestra advertencia y cierra sesión.
*/
import { getAuth } from 'firebase/auth';

import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { OnlineService } from '../../services/online.service';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';

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
    IonicModule,
    TranslatePipe
  ]
})
export class LoginPage implements OnInit, OnDestroy {

  showPassword = false;
  form: FormGroup;
  loading = false;
  private authSub?: Subscription;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private data: DataService,
    private router: Router,
    private toastCtrl: ToastController,
    private online: OnlineService,
    private cdr: ChangeDetectorRef
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

  ngOnInit(): void {
    // Si ya hay sesión (y verificada), sal inmediatamente del login
    this.authSub = this.authService.user$.subscribe(user => {
      if (user && user.emailVerified) {
        this.router.navigateByUrl('/profile', { replaceUrl: true });
      }
    });
  }

  // Exponer observable para deshabilitar botón cuando no hay conexión
  get isOnline$() {
    return this.online.isOnline$;
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
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
      this.errorMessage = 'Completa todos los campos correctamente.';
      await this.presentToast(this.errorMessage, 'danger');
      return;
    }

    // Si no hay conexión, no intentes login (Firebase requiere red para autenticar)
    this.errorMessage = null;
    if (!this.online.isOnline) {
      await this.presentToast('Se necesita conexión a internet para este proceso', 'warning');
      this.errorMessage = 'Se necesita conexión a internet para este proceso';
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
        return;
      }
      // Navegar de inmediato; operaciones de perfil en background para no bloquear el UI
  this.errorMessage = null;
  await this.presentToast('¡Login exitoso!', 'success');
      this.router.navigateByUrl('/profile', { replaceUrl: true });

      // Guardar perfil si no existe (no bloquear UI)
      if (user && user.emailVerified) {
        const uid = user.uid;
        this.data.getUserProfile(uid)
          .then(profile => {
            if (!profile) {
              return this.data.saveUserProfile(uid, {
                name: user.displayName || '',
                email: user.email,
                phone: user.phoneNumber || '',
                isAdmin: false,
                createdAt: new Date()
              });
            }
            return undefined;
          })
          .catch(e => console.error('Error creando perfil tras login:', e));
      }
    } catch (err: any) {
      const code = err?.code || '';
      let message = 'Error al iniciar sesión';
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/invalid-password':
          message = 'Usuario o contraseña incorrectos';
          break;
        case 'auth/user-not-found':
          message = 'El usuario no existe';
          break;
        case 'auth/too-many-requests':
          message = 'Demasiados intentos, intenta más tarde';
          break;
        case 'auth/network-request-failed':
          message = 'Fallo de red, verifica tu conexión';
          break;
        default:
          if (typeof err?.message === 'string' && err.message.trim()) {
            message = err.message;
          }
      }
  // Asegurar que el loader se apague antes de mostrar el toast
      this.loading = false;
      try { this.cdr.detectChanges(); } catch {}
      // Mostrar el toast de error de forma explícita
  this.errorMessage = message;
  await this.presentToast(message, 'danger');
      console.error('Login error:', err);
    } finally {
      // Garantizar estado consistente
      this.loading = false;
      try { this.cdr.detectChanges(); } catch {}
    }
  }
}