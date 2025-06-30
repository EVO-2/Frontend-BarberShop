import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      this.router.navigate(['/login']);
      return false;
    }

    const parsedUser = JSON.parse(user);
    const expectedRoles = route.data['roles'] as string[];

    if (expectedRoles && !expectedRoles.includes(parsedUser.rol)) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
