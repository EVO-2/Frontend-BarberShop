import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductosService, Producto } from 'src/app/core/services/productos.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ProductoDialogComponent } from '../producto-dialog/producto-dialog.component';
import { AuthService } from 'src/app/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {

  displayedColumns: string[] = [
    'imagen',
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

  // fallback local estable
  imagenFallback: string = 'assets/img/placeholder.svg';

  filtros: any = {
    nombre: '',
    categoria: '',
    sede: '',
    estado: ''
  };

  permisos: string[] = [];

  constructor(
    private productosService: ProductosService,
    private dialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarPermisos();
    this.configurarFiltro();
    this.obtenerProductos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // =========================
  // 🔐 Permisos (CORREGIDO)
  // =========================
  cargarPermisos() {
    const usuario = this.authService.getUsuario();

    if (!usuario) {
      this.permisos = [];
      return;
    }

    if (usuario.rol === 'admin') {
      this.permisos = ['*'];
      return;
    }

    if (usuario.permisos && Array.isArray(usuario.permisos)) {
      this.permisos = usuario.permisos;
      return;
    }

    if (usuario.rol?.permisos) {
      this.permisos = usuario.rol.permisos.map((p: any) =>
        typeof p === 'string' ? p : p.nombre
      );
      return;
    }

    this.permisos = [];
  }

  tienePermiso(permiso: string): boolean {
    const usuario = this.authService.getUsuario();

    if (usuario?.rol === 'admin') return true;

    if (this.permisos.includes('*')) return true;

    return this.permisos.includes(permiso);
  }

  // =========================
  // 📡 Obtener productos
  // =========================
  obtenerProductos() {
    this.loading = true;

    this.productosService.obtenerProductos(this.filtros).subscribe({
      next: (resp: any) => {

        let productos = resp?.productos || [];

        productos = productos.map((p: any) => {

          if (!p.imagen || typeof p.imagen !== 'string') {
            p.imagen = this.imagenFallback;
          }

          if (p.imagen && p.imagen.includes('res.cloudinary.com/demo/')) {
            p.imagen = this.imagenFallback;
          }

          if (p.imagen && !p.imagen.startsWith('http') && !p.imagen.startsWith('assets')) {
            p.imagen = this.imagenFallback;
          }

          return p;
        });

        this.dataSource.data = productos;
        this.loading = false;
      },

      error: () => {
        this.loading = false;
      }
    });
  }

  // =========================
  // 🔍 Filtros backend
  // =========================
  aplicarFiltros() {
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
  // 🔍 Filtro frontend
  // =========================
  configurarFiltro() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {

      const texto = filter.trim().toLowerCase();

      return (
        (data?.nombre || '').toLowerCase().includes(texto) ||
        (data?.categoria?.nombre || '').toLowerCase().includes(texto) ||
        (data?.proveedor?.nombre || '').toLowerCase().includes(texto) ||
        (data?.sede?.nombre || '').toLowerCase().includes(texto)
      );
    };
  }

  aplicarFiltro(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  // =========================
  // ➕ Crear
  // =========================
  crearProducto() {
    if (!this.tienePermiso('crear_producto')) return;

    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.obtenerProductos();
    });
  }

  // =========================
  // ✏️ Editar
  // =========================
  editarProducto(producto: any) {
    if (!this.tienePermiso('editar_producto')) return;

    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '500px',
      data: { producto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.obtenerProductos();
    });
  }

  // =========================
  // 💰 Registrar Venta
  // =========================
  registrarVenta(producto: any) {
    if (!this.tienePermiso('editar_producto')) return;

    if (producto.cantidad <= 0) {
      Swal.fire('Sin Stock', 'No hay unidades disponibles para vender', 'warning');
      return;
    }

    Swal.fire({
      title: 'Registrar Venta',
      text: `¿Cuántas unidades de ${producto.nombre} se vendieron? (Stock actual: ${producto.cantidad})`,
      input: 'number',
      inputAttributes: {
        min: '1',
        max: producto.cantidad,
        step: '1'
      },
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) {
          return 'Debe ingresar una cantidad válida';
        }
        if (Number(value) > producto.cantidad) {
          return 'No puede vender más del stock disponible';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const cantidad = Number(result.value);
        this.loading = true;
        this.productosService.registrarVenta(producto._id, cantidad).subscribe({
          next: () => {
            Swal.fire('Venta Registrada', `Se registraron ${cantidad} salidas del inventario`, 'success');
            this.obtenerProductos();
          },
          error: (err) => {
            this.loading = false;
            Swal.fire('Error', err.error?.msg || 'Error al registrar venta', 'error');
          }
        });
      }
    });
  }

  // =========================
  // 🗑️ Eliminar
  // =========================
  eliminarProducto(producto: Producto) {
    if (!this.tienePermiso('eliminar_producto')) return;

    const confirmar = confirm(`¿Eliminar producto ${producto.nombre}?`);
    if (!confirmar) return;

    this.productosService.eliminarProducto(producto._id).subscribe({
      next: () => this.obtenerProductos(),
      error: () => { }
    });
  }

  // =========================
  // 🔄 Estado
  // =========================
  cambiarEstado(producto: Producto) {
    if (!this.tienePermiso('editar_producto')) return;

    const nuevoEstado = !producto.estado;

    // 🔥 Optimistic UI (respuesta inmediata)
    producto.estado = nuevoEstado;

    this.productosService
      .cambiarEstado(producto._id, nuevoEstado)
      .subscribe({
        next: () => { },
        error: () => {
          producto.estado = !nuevoEstado;
        }
      });
  }
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;

    if (img.src.includes('placeholder.svg')) return;

    img.src = 'assets/img/placeholder.svg';
  }
}