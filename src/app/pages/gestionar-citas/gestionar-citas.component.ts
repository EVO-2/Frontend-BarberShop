import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CitaService } from 'src/app/shared/services/cita.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Cita } from 'src/app/shared/models/cita.model';

@Component({
  selector: 'app-gestionar-citas',
  templateUrl: './gestionar-citas.component.html',
  styleUrls: ['./gestionar-citas.component.scss']
})
export class GestionarCitasComponent implements OnInit {

  displayedColumns: string[] = ['cliente', 'fecha', 'hora', 'turno', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);  // usamos any porque adaptamos datos

  filtroCliente: string = '';
  filtroFecha: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private citaService: CitaService,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarCitas();

    // 🔎 Filtro compuesto (nombre + fecha)
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filtros = JSON.parse(filter);

      const coincideCliente = data.clienteNombre
        .toLowerCase()
        .includes(filtros.cliente.toLowerCase());

      let coincideFecha = true;
      if (filtros.fecha) {
        const fechaData = new Date(data.fecha).toDateString();
        const fechaFiltro = new Date(filtros.fecha).toDateString();
        coincideFecha = fechaData === fechaFiltro;
      }

      return coincideCliente && coincideFecha;
    };
  }

  private cargarCitas(): void {
    this.citaService.obtenerMisCitas().subscribe({
      next: (resp) => {
        this.dataSource.data = (resp.citas || []).map(c => ({
          id: c._id,
          fecha: c.fecha,
          turno: c.turno,
          hora: this.extraerHora(c.fecha),
          estado: c.estado || 'pendiente',
          duracionRealMin: (c as any).duracionRealMin,
          clienteNombre: typeof c.cliente === 'string'
            ? 'Cliente'
            : `${(c.cliente as any).usuario?.nombre} ${(c.cliente as any).usuario?.apellido || ''}`.trim()
        }));

        // 🔹 Activamos la paginación
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('❌ Error al cargar citas:', err);
        this.snack.open('Error al cargar citas', 'Cerrar', { duration: 3500 });
      }
    });
  }

  private extraerHora(fechaISO: string | Date): string {
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  }

  // 🔎 Aplicar filtro combinado (cliente + fecha)
  aplicarFiltros() {
    const filtros = {
      cliente: this.filtroCliente || '',
      fecha: this.filtroFecha
    };

    this.dataSource.filter = JSON.stringify(filtros);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  limpiarFiltros(): void {
    this.filtroCliente = '';
    this.filtroFecha = null;
    this.aplicarFiltros();
  }

  iniciarServicio(cita: any): void {
    const peluqueroId = this.auth.getCurrentUserId();
    if (!peluqueroId) {
      this.snack.open('No se pudo obtener el usuario actual', 'Cerrar', { duration: 3500 });
      return;
    }

    const ok = window.confirm(`Iniciar servicio de ${cita.clienteNombre}?`);
    if (!ok) return;

    this.citaService.iniciarServicio(String(cita.id), peluqueroId).subscribe({
      next: () => {
        this.snack.open('Servicio iniciado', 'Cerrar', { duration: 3500 });
        this.cargarCitas();
      },
      error: (err) => this.snack.open(err.message, 'Cerrar', { duration: 3500 })
    });
  }

  finalizarServicio(cita: any): void {
    const peluqueroId = this.auth.getCurrentUserId();
    if (!peluqueroId) {
      this.snack.open('No se pudo obtener el usuario actual', 'Cerrar', { duration: 3500 });
      return;
    }

    const notas = prompt('Notas del servicio (opcional):') || undefined;
    const ok = window.confirm(`Finalizar servicio de ${cita.clienteNombre}?`);
    if (!ok) return;

    this.citaService.finalizarServicio(String(cita.id), peluqueroId, notas).subscribe({
      next: (updated: any) => {
        this.snack.open(
          `Finalizado — duración: ${updated.duracionRealMin} min`,
          'Cerrar',
          { duration: 3500 }
        );
        this.cargarCitas();
      },
      error: (err) => this.snack.open(err.message, 'Cerrar', { duration: 3500 })
    });
  }

  cancelarCita(cita: any): void {
    const razon = prompt('Razón de la cancelación:') || undefined;
    const ok = window.confirm(`Cancelar cita de ${cita.clienteNombre}?`);
    if (!ok) return;

    this.citaService.cancelarCita(String(cita.id), razon).subscribe({
      next: () => {
        this.snack.open('Cita cancelada', 'Cerrar', { duration: 3500 });
        this.cargarCitas();
      },
      error: (err) => this.snack.open(err.message, 'Cerrar', { duration: 3500 })
    });
  }
}
