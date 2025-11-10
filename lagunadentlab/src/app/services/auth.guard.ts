import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      filter(user => user !== undefined),
      take(1),
      map(user => {
        // Requiere usuario autenticado y correo verificado
        if (user && user.emailVerified) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
