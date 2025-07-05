import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-formulario-cliente',
  templateUrl: './formulario-cliente.component.html',
  styleUrls: ['./formulario-cliente.component.scss']
})
export class FormularioClienteComponent {
  clienteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FormularioClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.clienteForm = this.fb.group({
      nombre: [data?.nombre || '', [Validators.required]],
      correo: [data?.correo || '', [Validators.required, Validators.email]],
      telefono: [data?.telefono || '', [Validators.required]],
      edad: [data?.edad || '', [Validators.required, Validators.min(1)]]
    });
  }

  guardar(): void {
    if (this.clienteForm.valid) {
      this.dialogRef.close(this.clienteForm.value);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
