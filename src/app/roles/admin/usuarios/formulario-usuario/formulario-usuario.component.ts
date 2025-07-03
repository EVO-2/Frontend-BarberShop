import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface UsuarioData {
  id?: number;
  nombre: string;
  correo: string;
  password?: string;
  rol: string;
}

@Component({
  selector: 'app-formulario-usuario',
  templateUrl: './formulario-usuario.component.html',
  styleUrls: ['./formulario-usuario.component.scss']
})
export class FormularioUsuarioComponent {
  formulario: FormGroup;
  esEdicion: boolean = false;

  roles = ['admin', 'barbero', 'cliente'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FormularioUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioData
  ) {
    this.esEdicion = !!data?.id;

    this.formulario = this.fb.group({
      nombre: [data?.nombre || '', Validators.required],
      correo: [data?.correo || '', [Validators.required, Validators.email]],
      password: ['', this.esEdicion ? [] : [Validators.required, Validators.minLength(6)]],
      rol: [data?.rol || '', Validators.required]
    });
  }

  guardar() {
    if (this.formulario.invalid) return;

    const datos = this.formulario.value;

    // Si es edición y el campo password está vacío, lo eliminamos
    if (this.esEdicion && !datos.password) {
      delete datos.password;
    }

    // Enviamos los datos al componente padre incluyendo el ID si aplica
    this.dialogRef.close({
      ...datos,
      id: this.data?.id
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
