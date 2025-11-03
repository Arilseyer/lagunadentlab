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

  constructor() {
    auth.onAuthStateChanged(async user => {
      this.userSubject.next(user);
      this.authChecked = true;
      // Limpieza: sin logs ni alertas innecesarias
    });
  }

  async resetPassword(email: string) {
    // Primero verificar si el email existe
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length === 0) {
      throw new Error('auth/user-not-found');
    }
    return sendPasswordResetEmail(auth, email);
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
