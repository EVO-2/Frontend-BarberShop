import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductosService, Producto } from 'src/app/core/services/productos.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ProductoDialogComponent } from '../producto-dialog/producto-dialog.component';

// 🔐 (ajústalo a tu implementación real)
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {

  // =========================
  // 📊 Tabla
  // =========================
  displayedColumns: string[] = [
    'nombre',
    'categoria',
    'proveedor',
    'sede',
    'tipo',
    'cantidad',
    'precio',
    'estado',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Producto>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = false;

  // =========================
  // 🔍 Filtros
  // =========================
  filtros: any = {
    nombre: '',
    categoria: '',
    sede: '',
    estado: ''
  };

  // =========================
  // 🔐 Permisos dinámicos
  // =========================
  permisos: string[] = [];

  constructor(
    private productosService: ProductosService,
    private dialog: MatDialog,
    private authService: AuthService
  ) { }

  // =========================
  // 🚀 Init
  // =========================
  ngOnInit(): void {
    this.cargarPermisos();
    this.configurarFiltro(); // 🔥 IMPORTANTE
    this.obtenerProductos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // =========================
  // 🔐 Cargar permisos usuario
  // =========================
  cargarPermisos() {
    const usuario = this.authService.getUsuario();

    console.log('👤 Usuario completo:', usuario); // 🔥 IMPORTANTE

    if (usuario?.permisos) {
      this.permisos = usuario.permisos;
    } else if (usuario?.rol?.permisos) {
      this.permisos = usuario.rol.permisos.map((p: any) =>
        typeof p === 'string' ? p : p.nombre
      );
    } else {
      this.permisos = [];
    }

    console.log('🔐 Permisos usuario:', this.permisos);
  }

  tienePermiso(permiso: string): boolean {
    const usuario = this.authService.getUsuario();

    // 🔥 ADMIN VE TODO (modo debug)
    if (usuario?.rol === 'admin') return true;

    return this.permisos.includes(permiso);
  }

  // =========================
  // 📡 Obtener productos
  // =========================
  obtenerProductos() {
    this.loading = true;

    this.productosService.obtenerProductos(this.filtros).subscribe({
      next: (resp) => {
        this.dataSource.data = resp.productos || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando productos', err);
        this.loading = false;
      }
    });
  }

  // =========================
  // 🔍 Aplicar filtros backend
  // =========================
  aplicarFiltros() {
    console.log('🔍 Filtros:', this.filtros);
    this.obtenerProductos();
  }

  limpiarFiltros() {
    this.filtros = {
      nombre: '',
      categoria: '',
      sede: '',
      estado: ''
    };
    this.obtenerProductos();
  }

  // =========================
  // 🔍 Filtro frontend (tabla)
  // =========================
  configurarFiltro() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return (
        data.nombre?.toLowerCase().includes(filter) ||
        data.categoria?.nombre?.toLowerCase().includes(filter) ||
        data.proveedor?.nombre?.toLowerCase().includes(filter) ||
        data.sede?.nombre?.toLowerCase().includes(filter)
      );
    };
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // =========================
  // ➕ Crear producto
  // =========================
  crearProducto() {
    if (!this.tienePermiso('crear_producto')) return;

    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProductos();
      }
    });
  }

  editarProducto(producto: any) {
    if (!this.tienePermiso('editar_producto')) return;

    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '500px',
      data: { producto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProductos();
      }
    });
  }

  // =========================
  // ❌ Eliminar (soft delete)
  // =========================
  eliminarProducto(producto: Producto) {
    if (!this.tienePermiso('eliminar_producto')) return;

    const confirmar = confirm(`¿Eliminar producto ${producto.nombre}?`);

    if (!confirmar) return;

    this.productosService.eliminarProducto(producto._id).subscribe({
      next: () => {
        console.log('✅ Producto eliminado');
        this.obtenerProductos();
      },
      error: (err) => {
        console.error('❌ Error eliminando', err);
      }
    });
  }

  // =========================
  // 🔄 Cambiar estado
  // =========================
  cambiarEstado(producto: Producto) {
    if (!this.tienePermiso('editar_producto')) return;

    this.productosService
      .cambiarEstado(producto._id, !producto.estado)
      .subscribe({
        next: () => {
          producto.estado = !producto.estado;
        },
        error: (err) => {
          console.error('❌ Error cambiando estado', err);
        }
      });
  }
}