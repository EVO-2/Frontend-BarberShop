import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { debounceTime, switchMap, map, catchError, first, of } from 'rxjs';
import { UsuarioService } from 'src/app/core/services/usuario.service';

export function correoExisteValidator(usuarioService: UsuarioService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) {
      return of(null); // Si no hay valor, no valida error
    }

    return of(control.value).pipe(
      debounceTime(500), // Espera antes de hacer la petición
      switchMap((correo: string) =>
        usuarioService.verificarCorreoExiste(correo).pipe(
          map((existe: boolean) => (existe ? { correoExiste: true } : null)),
          catchError(() => of(null)) // En error, ignora la validación
        )
      ),
      first() // Cierra el observable
    );
  };
}
