import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para contraseñas seguras:
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
 */
export function passwordSegura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value?.toString();

    if (!valor) return null;

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    return regex.test(valor) ? null : { passwordInsegura: true };
  };
}
