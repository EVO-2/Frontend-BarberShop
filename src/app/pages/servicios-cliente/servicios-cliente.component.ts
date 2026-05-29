import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiciosService, Servicio } from 'src/app/core/services/servicios.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-servicios-cliente',
  templateUrl: './servicios-cliente.component.html',
  styleUrls: ['./servicios-cliente.component.scss'],
})
export class ServiciosClienteComponent implements OnInit {

  servicios: Servicio[] = [];
  cargando: boolean = false;
  error: string = '';
  
  // Filtros y ordenación
  filtroNombre: string = '';
  ordenarPor: string = '';

  readonly baseUrl: string = environment.baseUrl; // ⚡ URL base del backend

  constructor(
    private serviciosService: ServiciosService,
    private router: Router
  ) { }

  get serviciosFiltrados(): Servicio[] {
    let resultado = [...this.servicios];

    if (this.filtroNombre?.trim()) {
      const query = this.filtroNombre.toLowerCase().trim();
      resultado = resultado.filter(s =>
        s.nombre.toLowerCase().includes(query) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(query))
      );
    }

    if (this.ordenarPor === 'precio-asc') {
      resultado.sort((a, b) => a.precio - b.precio);
    } else if (this.ordenarPor === 'precio-desc') {
      resultado.sort((a, b) => b.precio - a.precio);
    } else if (this.ordenarPor === 'duracion') {
      resultado.sort((a, b) => {
        const durA = parseInt(a.duracion, 10) || 0;
        const durB = parseInt(b.duracion, 10) || 0;
        return durA - durB;
      });
    }

    return resultado;
  }

  ngOnInit(): void {
    this.obtenerServicios();
  }

  private obtenerServicios(): void {
    this.cargando = true;
    this.error = '';

    this.serviciosService.obtenerServicios().subscribe({
      next: (data: Servicio[] | { servicios?: Servicio[] }) => {
        const lista: Servicio[] = Array.isArray(data) ? data : data?.servicios ?? [];

        // Filtrar solo activos
        const activos = lista.filter((s: Servicio) => s.estado === true);

        // Normalizar imágenes
        this.servicios = activos.map((servicio: Servicio) => ({
          ...servicio,
          imagenes: this.normalizarImagenes(servicio.imagenes ?? [])
        }));

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = 'Error al cargar los servicios';
      }
    });
  }

  // 🔹 Normaliza rutas de imágenes y aplica fallback
  private normalizarImagenes(imagenes: string[]): string[] {
    if (!imagenes?.length) return ['assets/no-image.jpg'];

    return imagenes
      .map(img => {
        if (!img) return 'assets/no-image.jpg';

        // Si ya es URL completa o base64
        if (img.startsWith('http') || img.startsWith('data:')) return img;

        // Construir ruta backend
        const rutaNormalizada = img.startsWith('/') ? img.slice(1) : img;
        return `${this.baseUrl}/${rutaNormalizada}`;
      })
      .filter(Boolean);
  }

  // 🔹 Obtener la imagen principal del servicio
  public obtenerImagenPrincipal(servicio: Servicio): string {
    if (!servicio?.imagenes?.length) return 'assets/no-image.jpg';
    return servicio.imagenes[0];
  }

  // 🔹 Reservar servicio sin usar localStorage
  public reservarServicio(servicio: Servicio): void {
    if (!servicio?._id) return;

    this.router.navigate(['/reservar'], {
      queryParams: { servicioId: servicio._id }
    });
  }
}