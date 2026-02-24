import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { SedeService } from 'src/app/core/services/sede.service';
import { Sede } from 'src/app/shared/models/sede.model';
import { Equipo } from 'src/app/shared/models/equipo.model';

@Component({
  selector: 'app-equipo-dialog',
  templateUrl: './equipo-dialog.component.html',
  styleUrls: ['./equipo-dialog.component.scss']
})
export class EquipoDialogComponent implements OnInit {

  form!: FormGroup;
  sedes: Sede[] = [];
  tipos: string[] = ['maquina', 'silla', 'secador', 'otro'];
  estados: string[] = ['activo', 'en_mantenimiento', 'dañado', 'fuera_de_servicio', 'retirado'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EquipoDialogComponent>,
    private equipoService: EquipoService,
    private sedeService: SedeService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { equipo?: Equipo }
  ) { }

  ngOnInit(): void {
    this.cargarSedes();
    this.inicializarFormulario();
  }

  // --------------------------------------
  // Inicializar formulario
  // --------------------------------------
  private inicializarFormulario(): void {
    this.form = this.fb.group({
      nombre: [this.data.equipo ? this.data.equipo.nombre : '', Validators.required],
      tipo: [this.data.equipo ? this.data.equipo.tipo : '', Validators.required],
      estado: [this.data.equipo ? this.data.equipo.estado : '', Validators.required],
      sede: [this.getSedeId(this.data.equipo?.sede ?? undefined), Validators.required]
    });
  }

  // --------------------------------------
  // Obtener ID de sede de manera segura
  // --------------------------------------
  private getSedeId(sede: string | Sede | undefined): string {
    if (!sede) return '';
    return typeof sede === 'string' ? sede : sede._id ?? '';
  }

  // --------------------------------------
  // Cargar sedes
  // --------------------------------------
  private cargarSedes(): void {
    this.sedeService.obtenerSedes().subscribe({
      next: resp => this.sedes = resp,
      error: () => {
        console.error('Error cargando sedes');
        this.mostrarMensaje('Error cargando sedes', true);
      }
    });
  }

  // --------------------------------------
  // Guardar equipo (crear o actualizar)
  // --------------------------------------
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;

    if (this.isEditing && this.data.equipo?._id) {
      // Actualizar
      this.equipoService.actualizar(this.data.equipo._id, payload).subscribe({
        next: res => {
          this.mostrarMensaje('✅ Equipo actualizado correctamente');
          this.dialogRef.close(res);
        },
        error: (err) => {
          console.error('Error actualizando equipo', err);
          this.mostrarMensaje('❌ Error actualizando equipo', true);
        }
      });
    } else {
      // Crear
      this.equipoService.crear(payload).subscribe({
        next: res => {
          this.mostrarMensaje('✅ Equipo creado correctamente');
          this.dialogRef.close(res);
        },
        error: (err) => {
          console.error('Error creando equipo', err);
          this.mostrarMensaje('❌ Error creando equipo', true);
        }
      });
    }
  }

  // --------------------------------------
  // Cancelar y cerrar dialog
  // --------------------------------------
  cancelar(): void {
    this.dialogRef.close();
  }

  // --------------------------------------
  // Getter para saber si estamos editando
  // --------------------------------------
  get isEditing(): boolean {
    return !!this.data.equipo;
  }

  // --------------------------------------
  // Mostrar mensajes con SnackBar
  // --------------------------------------
  private mostrarMensaje(mensaje: string, esError: boolean = false): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: esError ? ['snackbar-error'] : ['snackbar-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}