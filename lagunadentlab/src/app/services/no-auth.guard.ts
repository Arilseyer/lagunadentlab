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
                if (user) {
                    // Si está autenticado, redirigir al home
                    this.router.navigate(['/home']);
                    return of(false);
                }
                // Si no está autenticado, permitir acceso
                return of(true);
            })
        );
    }
}
