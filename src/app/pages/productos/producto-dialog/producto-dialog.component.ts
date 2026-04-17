import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductosService } from 'src/app/core/services/productos.service';

@Component({
  selector: 'app-producto-dialog',
  templateUrl: './producto-dialog.component.html',
  styleUrls: ['./producto-dialog.component.scss']
})
export class ProductoDialogComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  esEdicion = false;

  // 🔥 Catálogos dinámicos (luego conectamos API real)
  categorias: any[] = [];
  proveedores: any[] = [];
  sedes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private dialogRef: MatDialogRef<ProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.esEdicion = !!this.data?.producto;

    this.initForm();
    this.cargarCatalogos();

    if (this.esEdicion) {
      const p = this.data.producto;

      this.form.patchValue({
        nombre: p.nombre,
        categoria: p.categoria?._id,
        proveedor: p.proveedor?._id,
        sede: p.sede?._id,
        tipo: p.tipo,
        cantidad: p.cantidad,
        precio: p.precio,
        estado: p.estado
      });
    }
  }

  // =========================
  // 🧾 Formulario
  // =========================
  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      categoria: ['', Validators.required],
      proveedor: ['', Validators.required],
      sede: ['', Validators.required],
      tipo: ['venta', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      estado: [true]
    });
  }

  // =========================
  // 📡 Cargar selects
  // =========================
  cargarCatalogos() {
    // 🔥 Luego conectamos APIs reales
    this.categorias = [];
    this.proveedores = [];
    this.sedes = [];
  }

  // =========================
  // 💾 Guardar
  // =========================
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const data = this.form.value;

    const request = this.esEdicion
      ? this.productosService.actualizarProducto(this.data.producto._id, data)
      : this.productosService.crearProducto(data);

    request.subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('❌ Error guardando producto', err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}