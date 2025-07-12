import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.obtenerToken();

    if (token) {
      try {
        // ✅ Decodificar el payload del token
        const payload = JSON.parse(atob(token.split('.')[1]));

        // ✅ Verificar expiración (exp en segundos, Date.now en ms)
        const isExpired = payload?.exp && (payload.exp * 1000) < Date.now();

        if (isExpired) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Token expirado'));
        }

        // ✅ Clonar la petición y agregar el token al header
        const cloned = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        // ✅ Manejar errores (como 401)
        return next.handle(cloned).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.authService.cerrarSesion();
              this.router.navigate(['/login']);
            }
            return throwError(() => error);
          })
        );
      } catch (e) {
        console.warn('⚠️ Token inválido o corrupto');
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
        return throwError(() => new Error('Token inválido'));
      }
    }

    // ✅ Si no hay token, continuar la petición sin header
    return next.handle(req);
  }
}
