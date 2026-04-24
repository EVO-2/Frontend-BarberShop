import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductosService } from 'src/app/core/services/productos.service';
import { SedeService } from 'src/app/core/services/sede.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-producto-dialog',
  templateUrl: './producto-dialog.component.html',
  styleUrls: ['./producto-dialog.component.scss']
})
export class ProductoDialogComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  esEdicion = false;

  categorias: any[] = [];
  proveedores: any[] = [];
  sedes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private productosService: ProductosService,
    private sedeService: SedeService,
    private dialogRef: MatDialogRef<ProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.esEdicion = !!this.data?.producto;

    this.initForm();
    this.cargarCatalogos();

    if (this.esEdicion && this.data?.producto) {
      const p = this.data.producto;

      this.form.patchValue({
        nombre: p?.nombre || '',
        categoria: p?.categoria?._id || '',
        proveedor: p?.proveedor?._id || '',
        sede: p?.sede?._id || '',
        tipo: p?.tipo || 'venta',
        cantidad: p?.cantidad ?? 0,
        precio: p?.precio ?? 0,
        estado: p?.estado ?? true
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
  // 📡 Cargar datos reales
  // =========================
  cargarCatalogos() {

    // 🔹 Categorías
    this.http.get<any>(`${environment.apiUrl}/categorias`)
      .subscribe({
        next: (resp) => {
          this.categorias = Array.isArray(resp) ? resp : (resp?.categorias || []);
        },
        error: (err) => {
          console.error('❌ Error cargando categorías', err);
          this.categorias = [];
        }
      });

    // 🔹 Proveedores
    this.http.get<any>(`${environment.apiUrl}/proveedores`)
      .subscribe({
        next: (resp) => {
          this.proveedores = Array.isArray(resp) ? resp : (resp?.proveedores || []);
        },
        error: (err) => {
          console.error('❌ Error cargando proveedores', err);
          this.proveedores = [];
        }
      });

    // 🔹 Sedes (solo activas)
    this.sedeService.obtenerSedes()
      .subscribe({
        next: (sedes: any[]) => {
          // tolerante a datos viejos (estado / activo)
          this.sedes = (sedes || []).filter(s => s?.estado === true || s?.activo === true);
        },
        error: (err) => {
          console.error('❌ Error cargando sedes', err);
          this.sedes = [];
        }
      });
  }

  // =========================
  // 💾 Guardar
  // =========================
  guardar() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const formValue = this.form.value;

    // 🔥 Payload limpio (solo lo necesario)
    const payload = {
      nombre: (formValue.nombre || '').trim(),
      categoria: formValue.categoria,
      proveedor: formValue.proveedor,
      sede: formValue.sede,
      tipo: formValue.tipo,
      cantidad: formValue.cantidad,
      precio: formValue.precio,
      estado: formValue.estado
    };

    console.log('📦 Payload producto:', payload);

    const request = this.esEdicion
      ? this.productosService.actualizarProducto(this.data.producto._id, payload)
      : this.productosService.crearProducto(payload);

    request
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('❌ Error guardando producto', err);
        }
      });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}