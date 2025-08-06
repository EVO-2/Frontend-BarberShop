import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

export function emailExisteValidator(authService: AuthService, correoActual?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.value;

    // Si el email no ha cambiado, no validar
    if (!email || email.trim() === '' || email === correoActual) {
      return of(null);
    }

    return authService.verificarCorreo(email).pipe(
      map(respuesta => {
        if (respuesta && typeof respuesta.existe === 'boolean') {
          return respuesta.existe ? { emailExiste: true } : null;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  };
}
