// src/app/shared/validators/email-existe.validator.ts
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export function emailExisteValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const email = control.value;
    if (!email) return of(null);

    return authService.verificarCorreo(email).pipe(
      map(respuesta => (respuesta.existe ? { emailExiste: true } : null)),
      catchError(() => of(null)) // En caso de error, no bloquea el formulario
    );
  };
}
