import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

export function emailExisteValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.value;

    // Verifica que el email no esté vacío o compuesto solo de espacios
    if (!email || email.trim() === '') {
      return of(null);
    }

    // Llama al backend y verifica si el correo ya existe
    return authService.verificarCorreo(email).pipe(
      map(respuesta => {
        if (respuesta && typeof respuesta.existe === 'boolean') {
          return respuesta.existe ? { emailExiste: true } : null;
        }
        return null; // si la respuesta no es válida
      }),
      catchError(() => of(null)) // En caso de error, no bloquea el formulario
    );
  };
}
