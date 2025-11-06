/**
 * Guard para prevenir acceso a páginas de login/register si el usuario ya está autenticado
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, interval, of } from 'rxjs';
import { switchMap, take, filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(): Observable<boolean> {
        // Esperar a que authChecked sea true antes de evaluar el usuario
        return interval(100).pipe(
            filter(() => this.authService['authChecked']),
            take(1),
            switchMap(() => this.authService.user$),
            switchMap(user => {
                // Solo bloquea acceso a login/register si el usuario está VERIFICADO
                // Usuarios no verificados deben poder acceder a login/register para completar el flujo
                if (user?.emailVerified) {
                    // Usuario verificado: redirigir a su área (mejor a profile que a home)
                    this.router.navigate(['/profile']);
                    return of(false);
                }
                // No hay sesión o no verificado: permitir acceso
                return of(true);
            })
        );
    }
}
