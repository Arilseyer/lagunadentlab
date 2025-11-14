/**
 * Servicio de autenticación para gestionar el usuario actual, login, logout y recuperación de contraseña.
 * Utiliza Firebase Auth y expone un observable user$ para el estado de sesión.
 */
import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, UserCredential, sendPasswordResetEmail, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from 'src/environments/firebase';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private userSubject = new BehaviorSubject<any>(undefined);
  user$: Observable<any> = this.userSubject.asObservable();
  private authChecked = false;
  private pushNotificationService?: any; // Lazy load to avoid circular dependency

  constructor() {
    auth.onAuthStateChanged(async user => {
      this.userSubject.next(user);
      this.authChecked = true;
      
      // Inicializar push notifications cuando hay usuario autenticado
      if (user && this.pushNotificationService) {
        await this.pushNotificationService.initialize();
      } else if (!user && this.pushNotificationService) {
        await this.pushNotificationService.cleanup();
      }
    });
  }

  /**
   * Inyectar el servicio de push notifications (lazy load)
   * Se llama desde app.component.ts para evitar dependencia circular
   */
  setPushNotificationService(service: any): void {
    this.pushNotificationService = service;
  }

  async resetPassword(email: string) {
    // Intentar enviar directamente; si no existe el usuario, Firebase responderá con error
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      // Normalizar algunos errores
      if (e?.code === 'auth/user-not-found') {
        throw new Error('auth/user-not-found');
      }
      throw e;
    }
  }

  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  logout(): Promise<void> {
    return auth.signOut();
  }

  getCurrentUser() {
    return auth.currentUser;
  }
}
