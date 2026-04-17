import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Rol } from '../../../shared/models/roles.model';
import { PermisosService } from 'src/app/core/services/permisos.service';

@Component({
  selector: 'app-rol-dialog',
  templateUrl: './rol-dialog.component.html',
  styleUrls: ['./rol-dialog.component.scss']
})
export class RolDialogComponent implements OnInit {

  form: FormGroup;
  editando: boolean = false;

  // 🔥 lista completa de permisos desde backend
  permisos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private permisosService: PermisosService,
    private dialogRef: MatDialogRef<RolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Rol | null
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      permisos: [[]]
    });
  }

  ngOnInit(): void {
    this.cargarPermisos();

    if (this.data) {
      this.editando = true;

      this.form.patchValue({
        nombre: this.data.nombre,
        descripcion: this.data.descripcion,

        // 🔥 IMPORTANTE: convertir permisos a IDS
        permisos: this.data.permisos?.map((p: any) => p._id) || []
      });
    }
  }

  // =============================
  // Cargar permisos desde backend
  // =============================
  cargarPermisos() {
    this.permisosService.getPermisos().subscribe({
      next: (res: any) => {
        this.permisos = res?.permisos || [];
      },
      error: (err) => console.error('Error cargando permisos', err)
    });
  }

  // =============================
  // Toggle checkbox
  // =============================
  togglePermiso(id: string) {
    const permisosActuales: string[] = this.form.value.permisos;

    if (permisosActuales.includes(id)) {
      this.form.patchValue({
        permisos: permisosActuales.filter(p => p !== id)
      });
    } else {
      this.form.patchValue({
        permisos: [...permisosActuales, id]
      });
    }
  }

  // =============================
  // Validar si está seleccionado
  // =============================
  isChecked(id: string): boolean {
    return this.form.value.permisos.includes(id);
  }

  // =============================
  // Guardar
  // =============================
  guardar() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    // 🔥 Validación obligatoria de permisos
    if (!formValue.permisos || formValue.permisos.length === 0) {
      alert('Debes seleccionar al menos un permiso');
      return;
    }

    // 🔥 Normalización defensiva (evita null/undefined)
    const permisosIds: string[] = Array.isArray(formValue.permisos)
      ? formValue.permisos
      : [];

    const payload = {
      nombre: formValue.nombre?.trim(),
      descripcion: formValue.descripcion?.trim() || '',

      // 🔥 SIEMPRE enviar IDS (compatibilidad con backend Mongo)
      permisos: permisosIds,

      estado: true
    };

    this.dialogRef.close(payload);
  }

  cerrar() {
    this.dialogRef.close();
  }
}