/**
 * Guard para proteger rutas solo para administradores.
 * Verifica el custom claim 'admin' en el token del usuario autenticado.
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { interval } from 'rxjs';
import { filter, take, switchMap as rxSwitchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Esperar a que authChecked sea true antes de evaluar el usuario
    return interval(100).pipe(
      filter(() => this.authService['authChecked']),
      take(1),
      rxSwitchMap(() => this.authService.user$),
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return of(false);
        }
        return from(user.getIdTokenResult()).pipe(
          map((idTokenResult: any) => {
            if (idTokenResult.claims && idTokenResult.claims.admin === true) {
              return true;
            } else {
              this.router.navigate(['/']);
              return false;
            }
          })
        );
      })
    );
  }
}
