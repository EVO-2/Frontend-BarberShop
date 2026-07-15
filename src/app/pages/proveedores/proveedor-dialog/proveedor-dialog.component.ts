import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Proveedor, ProveedoresService } from 'src/app/core/services/proveedores.service';

@Component({
  selector: 'app-proveedor-dialog',
  templateUrl: './proveedor-dialog.component.html',
  styleUrls: ['./proveedor-dialog.component.scss']
})
export class ProveedorDialogComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private dialogRef: MatDialogRef<ProveedorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { proveedor?: Proveedor }
  ) { }

  ngOnInit(): void {
    this.esEdicion = !!this.data?.proveedor;

    this.form = this.fb.group({
      nombre: [this.data?.proveedor?.nombre || '', [Validators.required, Validators.minLength(2)]],
      contacto: [this.data?.proveedor?.contacto || ''],
      telefono: [this.data?.proveedor?.telefono || ''],
      email: [this.data?.proveedor?.email || '', [Validators.email]],
      direccion: [this.data?.proveedor?.direccion || ''],
      estado: [this.data?.proveedor?.estado ?? true]
    });
  }

  guardar() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload: Proveedor = this.form.value;

    const request = this.esEdicion
      ? this.proveedoresService.actualizarProveedor(this.data.proveedor!._id!, payload)
      : this.proveedoresService.crearProveedor(payload);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}
