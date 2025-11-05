import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PuestoService } from 'src/app/core/services/puesto.service';
import { PuestoTrabajo } from 'src/app/shared/models/puesto-trabajo.model';

@Component({
  selector: 'app-puesto-dialog',
  templateUrl: './puesto-dialog.component.html',
  styleUrls: ['./puesto-dialog.component.scss']
})
export class PuestoDialogComponent implements OnInit {
  formPuesto!: FormGroup;
  modoEdicion = false;
  sedeSeleccionada: any;
  puesto: PuestoTrabajo | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PuestoDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { puesto?: PuestoTrabajo; sede?: any; modo?: string },
    private puestoService: PuestoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.modoEdicion = this.data.modo === 'editar';
    this.puesto = this.data.puesto || null;
    this.sedeSeleccionada = this.data.sede || this.puesto?.sede || null;

    this.formPuesto = this.fb.group({
      nombre: [this.puesto?.nombre || '', [Validators.required, Validators.minLength(3)]],
      sede_nombre: [this.sedeSeleccionada?.nombre || 'Sin asignar'],
      sede_id: [this.sedeSeleccionada?._id || '', Validators.required],
      estado: [this.puesto?.estado ?? true]
    });

    this.formPuesto.get('sede_nombre')?.disable();
  }

  /** Guardar o actualizar puesto */
  guardarPuesto(): void {
    if (this.formPuesto.invalid) {
      return;
    }

    const formValue = this.formPuesto.getRawValue();

    const puestoData = {
      nombre: formValue.nombre,
      estado: formValue.estado,
      sede: this.sedeSeleccionada?._id || formValue.sede_id
    };

    if (!puestoData.sede) {
      this.mostrarMensaje('Debe asignar una sede antes de guardar el puesto.');
      return;
    }

    if (this.modoEdicion && this.data?.puesto?._id) {
      this.puestoService.actualizarPuesto(this.data.puesto._id, puestoData).subscribe({
        next: () => {
          this.mostrarMensaje('Puesto actualizado correctamente');
          this.dialogRef.close(true);
        },
        error: () => this.mostrarMensaje('Error al actualizar el puesto')
      });
    } else {
      this.puestoService.crearPuesto(puestoData).subscribe({
        next: () => {
          this.mostrarMensaje('Puesto creado correctamente');
          this.dialogRef.close(true);
        },
        error: () => this.mostrarMensaje('Error al crear el puesto')
      });
    }
  }

  /** Cerrar diálogo sin guardar */
  cancelar(): void {
    this.dialogRef.close(false);
  }

  /** Mostrar notificación */
  mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
