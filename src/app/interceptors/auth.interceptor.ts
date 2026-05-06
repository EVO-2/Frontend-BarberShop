import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();
    let authReq = req;

    // 🔐 Agregar token si existe
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(

      catchError((error: HttpErrorResponse) => {

        // 🔥 CONTROL INTELIGENTE DE 401
        // Evita logout en login y en carga inicial de perfil
        if (
          error.status === 401 &&
          !req.url.includes('/auth/login') &&
          !req.url.includes('/usuarios/perfil')
        ) {
          this.authService.logout();
        }

        // 🔥 CONTROL DE SUSCRIPCIÓN VENCIDA (403 SaaS)
        if (error.status === 403 && error.error?.accionRequerida === 'pagar_suscripcion') {
          // Si estás usando router en el constructor, redirige aquí.
          // Para no romper inyecciones circulares, podemos usar window.location
          window.location.href = '/suscripcion-vencida';
        }

        return throwError(() => error);
      })

    );
  }
}