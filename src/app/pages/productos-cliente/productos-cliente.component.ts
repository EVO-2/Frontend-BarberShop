import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductosService, Producto } from 'src/app/core/services/productos.service';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

interface CartItem {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-productos-cliente',
  templateUrl: './productos-cliente.component.html',
  styleUrls: ['./productos-cliente.component.scss'],
})
export class ProductosClienteComponent implements OnInit {

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  cargando: boolean = false;
  error: string = '';
  textoBusqueda: string = '';

  carrito: CartItem[] = [];
  mostrarCarrito: boolean = false;

  readonly baseUrl: string = environment.baseUrl;
  imagenFallback = 'assets/img/placeholder.svg';

  constructor(
    private productosService: ProductosService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  private obtenerProductos(): void {
    this.cargando = true;
    this.error = '';

    this.productosService.obtenerProductos().subscribe({
      next: (data) => {
        const lista: Producto[] = data?.productos || [];
        // Filtrar solo activos y de venta al publico
        this.productos = lista.filter((p: Producto) => p.estado === true && p.tipo === 'venta');
        this.productosFiltrados = [...this.productos];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = 'Error al cargar los productos';
      }
    });
  }

  public aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.textoBusqueda = valor;

    if (!valor) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(valor) ||
      p.categoria?.nombre?.toLowerCase().includes(valor)
    );
  }

  // ==========================
  // LÓGICA DEL CARRITO
  // ==========================

  public agregarAlCarrito(producto: Producto): void {
    if (producto.cantidad <= 0) {
      this.snackBar.open('No hay stock disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    const itemExistente = this.carrito.find(item => item.producto._id === producto._id);

    if (itemExistente) {
      if (itemExistente.cantidad >= producto.cantidad) {
        this.snackBar.open('Límite de stock alcanzado', 'Cerrar', { duration: 3000 });
        return;
      }
      itemExistente.cantidad += 1;
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
    
    this.mostrarCarrito = true;
    this.snackBar.open(`${producto.nombre} agregado al carrito`, 'Cerrar', { duration: 2000 });
  }

  public removerDelCarrito(id: string): void {
    this.carrito = this.carrito.filter(item => item.producto._id !== id);
    if (this.carrito.length === 0) {
      this.mostrarCarrito = false;
    }
  }

  public actualizarCantidad(item: CartItem, incremento: number): void {
    const nuevaCantidad = item.cantidad + incremento;
    
    if (nuevaCantidad <= 0) {
      this.removerDelCarrito(item.producto._id);
    } else if (nuevaCantidad <= item.producto.cantidad) {
      item.cantidad = nuevaCantidad;
    } else {
      this.snackBar.open('Stock máximo alcanzado', 'Cerrar', { duration: 3000 });
    }
  }

  get totalCarrito(): number {
    return this.carrito.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  get cantidadItemsCarrito(): number {
    return this.carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }

  public finalizarCompra(): void {
    if (this.carrito.length === 0) return;
    
    // Aquí iría la lógica de procesar pago o crear orden
    this.snackBar.open('¡Compra procesada! Pronto te contactaremos.', 'Cerrar', { duration: 5000 });
    this.carrito = [];
    this.mostrarCarrito = false;
  }
}
