import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Categoria, CategoriasService } from 'src/app/core/services/categorias.service';

@Component({
  selector: 'app-categoria-dialog',
  templateUrl: './categoria-dialog.component.html',
  styleUrls: ['./categoria-dialog.component.scss']
})
export class CategoriaDialogComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private categoriasService: CategoriasService,
    private dialogRef: MatDialogRef<CategoriaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categoria?: Categoria }
  ) { }

  ngOnInit(): void {
    this.esEdicion = !!this.data?.categoria;

    this.form = this.fb.group({
      nombre: [this.data?.categoria?.nombre || '', [Validators.required, Validators.minLength(2)]],
      descripcion: [this.data?.categoria?.descripcion || ''],
      estado: [this.data?.categoria?.estado ?? true]
    });
  }

  guardar() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload: Categoria = this.form.value;

    const request = this.esEdicion
      ? this.categoriasService.actualizarCategoria(this.data.categoria!._id!, payload)
      : this.categoriasService.crearCategoria(payload);

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
