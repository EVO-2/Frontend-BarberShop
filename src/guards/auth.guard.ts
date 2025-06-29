// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const user = JSON.parse(userData);
      const expectedRoles = route.data['roles'] as string[]; // ← roles permitidos definidos en la ruta

      if (!expectedRoles || expectedRoles.includes(user.rol)) {
        return true;
      } else {
        // El usuario no tiene el rol requerido
        this.router.navigate(['/login']);
        return false;
      }
    }

    // No está autenticado
    this.router.navigate(['/login']);
    return false;
  }
}
