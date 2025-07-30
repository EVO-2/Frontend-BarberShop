import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para que dos campos coincidan (ej: contraseña y confirmación).
 */
export function passwordsIguales(passwordKey: string, confirmarKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirmar = group.get(confirmarKey)?.value;

    if (password !== confirmar) {
      group.get(confirmarKey)?.setErrors({ noCoinciden: true });
      return { noCoinciden: true };
    } else {
      const errors = group.get(confirmarKey)?.errors;
      if (errors) {
        delete errors['noCoinciden'];
        if (Object.keys(errors).length === 0) {
          group.get(confirmarKey)?.setErrors(null);
        }
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
    const valor = control.value;
    const regex = /^\d{10}$/;

    if (!regex.test(valor)) {
      return { telefonoInvalido: true };
    }

    return null;
  };
}
