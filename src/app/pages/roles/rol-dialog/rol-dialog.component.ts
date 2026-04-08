import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Rol } from '../../../shared/models/roles.model';

@Component({
  selector: 'app-rol-dialog',
  templateUrl: './rol-dialog.component.html',
  styleUrls: ['./rol-dialog.component.scss']
})
export class RolDialogComponent implements OnInit {

  form: FormGroup;
  editando: boolean = false;

  constructor(
    private fb: FormBuilder,
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
    if (this.data) {
      this.editando = true;

      this.form.patchValue({
        nombre: this.data.nombre,
        descripcion: this.data.descripcion,
        permisos: this.data.permisos
      });
    }
  }

  guardar() {
    if (this.form.invalid) return;

    this.dialogRef.close(this.form.value);
  }

  cerrar() {
    this.dialogRef.close();
  }
}