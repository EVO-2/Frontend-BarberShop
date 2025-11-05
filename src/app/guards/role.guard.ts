import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const token = localStorage.getItem('token');
    const usuario = this.authService.getUsuarioActual(); // debe existir en tu AuthService

    if (!token || !usuario) {
      return this.router.parseUrl('/login');
    }

    const rolesPermitidos: string[] = route.data['roles'];
    if (rolesPermitidos && rolesPermitidos.includes(usuario.rol)) {
      return true;
    }

    // 🚫 Usuario con rol no permitido
    alert('No tienes permisos para acceder a esta página');
    return this.router.parseUrl('/dashboard');
  }
}
