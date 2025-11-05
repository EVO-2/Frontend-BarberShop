import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para que dos campos coincidan (ej: contraseña y confirmación).
 */
export function passwordsIguales(passwordKey: string, confirmarKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const passwordControl = group.get(passwordKey);
    const confirmarControl = group.get(confirmarKey);

    if (!passwordControl || !confirmarControl) return null;

    const password = passwordControl.value;
    const confirmar = confirmarControl.value;

    if (password !== confirmar) {
      confirmarControl.setErrors({ ...confirmarControl.errors, noCoinciden: true });
      return { noCoinciden: true };
    } else {
      if (confirmarControl.errors) {
        const { noCoinciden, ...otrosErrores } = confirmarControl.errors;
        confirmarControl.setErrors(Object.keys(otrosErrores).length ? otrosErrores : null);
      }
    }

    return null;
  };
}

/**
 * Validador para teléfono: exactamente 10 dígitos numéricos.
 */
export function telefonoValido(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value?.toString().trim();
    const regex = /^\d{10}$/;

    if (!regex.test(valor)) {
      return { telefonoInvalido: true };
    }

    return null;
  };
}
