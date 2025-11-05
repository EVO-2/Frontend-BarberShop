import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Sede, SedeService } from 'src/app/core/services/sede.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sede-dialog',
  templateUrl: './sede-dialog.component.html',
  styleUrls: ['./sede-dialog.component.scss'],
})
export class SedeDialogComponent implements OnInit {
  form!: FormGroup;
  titulo = 'Nueva Sede';
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SedeDialogComponent>,
    private sedeService: SedeService,
    private snack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data?: Sede
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: [
        this.data?.nombre || '',
        [Validators.required, Validators.minLength(3)],
      ],
      direccion: [
        this.data?.direccion || '',
        [Validators.required],
      ],
      telefono: [
        this.data?.telefono || '',
        [Validators.required, Validators.pattern('^[0-9]{7,10}$')],
      ],
      estado: [this.data?.estado ?? true],
    });

    if (this.data) {
      this.titulo = 'Editar Sede';
    }
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.cargando = true;
    const sedeData: Sede = this.form.value;

    const peticion = this.data
      ? this.sedeService.actualizarSede(this.data._id!, sedeData)
      : this.sedeService.crearSede(sedeData);

    peticion.subscribe({
      next: () => {
        this.snack.open(
          `Sede ${this.data ? 'actualizada' : 'creada'} correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.snack.open('Error al guardar la sede', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
