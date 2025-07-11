import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'rxjs';

@Component({
  selector: 'app-usuario-form-dialog',
  templateUrl: './usuario-form-dialog.component.html',
  styleUrls: ['./usuario-form-dialog.component.scss']
})
export class UsuarioFormDialogComponent {
  form: FormGroup;
  esEdicion: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.esEdicion = !!data?.usuario;

    this.form = this.fb.group({
      nombre: [data?.usuario?.nombre || '', Validators.required],
      correo: [data?.usuario?.correo || '', [Validators.required, Validators.email]],
      password: ['', this.esEdicion ? [] : [Validators.required, Validators.minLength(6)]],
      rol: [data?.usuario?.rol || '', Validators.required],
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
  if (this.form.valid) {
    const formValue = this.form.getRawValue(); // getRawValue permite acceder a campos deshabilitados
    this.dialogRef.close(formValue);
  }
}

}


