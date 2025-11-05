// =================== ADAPTER DE FECHAS ===================
import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class EsDateAdapter extends NativeDateAdapter {}


// =================== COMPONENTE GESTIONAR CITAS ===================
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { CitaService } from 'src/app/shared/services/cita.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfirmDialogComponent, ConfirmDialogData } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { Cita } from 'src/app/shared/models/cita.model';

@Component({
  selector: 'app-gestionar-citas',
  templateUrl: './gestionar-citas.component.html',
  styleUrls: ['./gestionar-citas.component.scss']
})
export class GestionarCitasComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['cliente', 'fecha', 'hora', 'turno', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  filtroCliente: string = '';
  filtroFecha: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 5;
  pageIndex = 0;
  totalCitas = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  constructor(
    private citaService: CitaService,
    private auth: AuthService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.cd.detectChanges(); 
    }
  }

  private obtenerHoraActual(): string {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private cargarCitas(filtros: any = {}): void {
    // ⚡ Eliminamos el envío del rol, lo maneja el backend desde req.user

    this.citaService.obtenerCitasPaginadas(this.pageIndex + 1, this.pageSize, filtros)
      .subscribe({
        next: (resp: any) => {
          const citasAdaptadas = (resp.citas || []).map((c: any) => {
            const clienteNombre = c.cliente?.usuario
              ? `${c.cliente.usuario.nombre || ''} ${c.cliente.usuario.apellido || ''}`.trim()
              : '';
            const peluqueroNombre = c.peluquero?.usuario
              ? `${c.peluquero.usuario.nombre || ''} ${c.peluquero.usuario.apellido || ''}`.trim()
              : '';

            const inicioServicio = c.inicioServicio || c.inicio_servicio || c.fecha || null;
            const finServicio = c.finServicio || c.fin_servicio || null;
            const duracionRealMin = c.duracionRealMin || c.duracion_real_min || 0;

            return {
              id: c._id,
              fecha: c.fecha,
              turno: c.turno,
              hora: this.extraerHora(c.fecha),
              estado: c.estado || 'pendiente',
              duracionRealMin,
              inicioServicio,
              finServicio,
              clienteNombre,
              cliente: c.cliente,
              peluqueroNombre,
              servicios: c.servicios
            };
          });

          this.dataSource.data = citasAdaptadas;
          this.totalCitas = resp.total || citasAdaptadas.length;

          this.dataSource.data.forEach(cita => {
            if (!cita.inicioServicio) {
              cita.inicioServicio = cita.fecha;
            }
          });
        },
        error: (err: any) => {
          const msg = err?.error?.mensaje || err.message || 'Error al cargar citas';
          this.snack.open(`❌ ${msg}`, 'Cerrar', { duration: 3500 });
        }
      });
  }

  private extraerHora(fechaISO: string | Date | null | undefined): string {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) return '';
    return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.cargarCitas();
  }

  aplicarFiltros(): void {
    const filtros: any = {};

    if (this.filtroCliente?.trim()) filtros.filtroGeneral = this.filtroCliente.trim();
    if (this.filtroFecha) {
      filtros.fecha = {
        inicio: new Date(this.filtroFecha.setHours(0, 0, 0, 0)).toISOString(),
        fin: new Date(this.filtroFecha.setHours(23, 59, 59, 999)).toISOString()
      };
    }

    this.pageIndex = 0;
    this.cargarCitas(filtros);
  }

  limpiarFiltros(): void {
    this.filtroCliente = '';
    this.filtroFecha = null;
    this.aplicarFiltros();
  }

  iniciarCita(cita: any): void {
    const peluqueroId = String(this.auth.getCurrentUserId());
    if (!peluqueroId) return;

    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Iniciar cita',
          message: `¿Deseas iniciar la cita de ${cita.clienteNombre}?`,
          confirmText: 'Iniciar',
          cancelText: 'Cancelar'
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const horaInicio = this.obtenerHoraActual();

      this.citaService.iniciarCita(String(cita.id), peluqueroId, horaInicio).subscribe({
        next: (res: any) => {
          this.cargarCitas();

          const citaActualizada = {
            ...cita,
            inicioServicio: res.inicioServicio || cita.inicioServicio || horaInicio,
            finServicio: res.finServicio || null,
            duracionRealMin: res.duracionRealMin || 0,
            estado: res.estado || 'en_proceso',
          };

          const index = this.dataSource.data.findIndex(c => c.id === cita.id);
          if (index !== -1) {
            this.dataSource.data[index] = citaActualizada;
            this.dataSource.data = [...this.dataSource.data];
          } else {
            this.dataSource.data = [...this.dataSource.data, citaActualizada];
          }

          this.snack.open('✅ Cita iniciada', 'Cerrar', { duration: 3500 });
        },
        error: (err: any) => {
          this.snack.open(err.error?.mensaje || `❌ Error al iniciar cita`, 'Cerrar', { duration: 3500 });
          this.cargarCitas();
        }
      });
    });
  }

  finalizarCita(cita: any): void {
    if (cita.estado !== 'en_proceso') {
      this.snack.open('⚠️ La cita no está en proceso y no puede finalizarse', 'Cerrar', { duration: 3500 });
      return;
    }

    const peluqueroId = String(this.auth.getCurrentUserId());
    if (!peluqueroId) return;

    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Finalizar cita',
          message: `¿Quieres finalizar la cita de ${cita.clienteNombre}?`,
          confirmText: 'Finalizar',
          cancelText: 'Cancelar'
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const ahora = new Date();
      const horaFin = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
      const horaPayload = horaFin && horaFin.trim() !== '' ? horaFin.trim() : undefined;

      this.citaService.finalizarCita(String(cita.id), peluqueroId, horaPayload).subscribe({
        next: (response: any) => {
          const updated: Cita = response.data || response; // ✅ soporte flexible
          this.cargarCitas();

          const index = this.dataSource.data.findIndex(c => c.id === cita.id);
          if (index !== -1) {
            this.dataSource.data[index] = { ...this.dataSource.data[index], ...updated };
            this.dataSource.data = [...this.dataSource.data];
          } else {
            this.cargarCitas();
          }

          const duracion = updated?.duracionRealMin ?? 0;
          const duracionFormateada = this.formatDuracion(duracion);

          this.snack.open(`✅ Cita finalizada — duración: ${duracionFormateada}`, 'Cerrar', { duration: 3500 });
        },
        error: (err) => {
          this.snack.open(err.error?.mensaje || `❌ Error al finalizar cita`, 'Cerrar', { duration: 3500 });
          this.cargarCitas();
        }
      });
    });
  }

  formatearFechaDetallada(fechaISO: string | Date | null | undefined): string {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatearTooltipCliente(cliente: any): string {
    if (!cliente) return 'Cliente';
    const nombre = cliente.usuario ? `${cliente.usuario.nombre || ''} ${cliente.usuario.apellido || ''}`.trim() : 'Cliente';
    const telefono = cliente.telefono || 'Sin teléfono';
    const direccion = cliente.direccion || 'Sin dirección';
    return `${nombre}\nTel: ${telefono}\nDirección: ${direccion}`;
  }

  calcularDuracion(cita: any): string {
    if (!cita) return '-';

    if (cita.estado !== 'finalizada') return '-';

    const stored = cita.duracionRealMin ?? cita.duracion_real_min;
    if (typeof stored === 'number' && !isNaN(stored)) {
      return `${stored} min`;
    }

    const inicio = cita.inicioServicio ?? cita.inicio_servicio ?? cita.fecha ?? null;
    const fin = cita.finServicio ?? cita.fin_servicio ?? null;

    if (inicio && fin) {
      const inicioMs = new Date(inicio).getTime();
      const finMs = new Date(fin).getTime();

      if (!isNaN(inicioMs) && !isNaN(finMs) && finMs > inicioMs) {
        const minutos = Math.round((finMs - inicioMs) / 60000);
        return `${minutos} min`;
      }
    }

    if (Array.isArray(cita.servicios) && cita.servicios.length > 0) {
      let total = 0;
      let any = false;

      for (const s of cita.servicios) {
        if (!s) continue;

        if (typeof s.duracionRealMin === 'number' && !isNaN(s.duracionRealMin)) {
          total += s.duracionRealMin;
          any = true;
        } else if (typeof s.duracion === 'number' && !isNaN(s.duracion)) {
          total += s.duracion;
          any = true;
        } else if (typeof s.duracion_min === 'number' && !isNaN(s.duracion_min)) {
          total += s.duracion_min;
          any = true;
        }
      }

      if (any) {
        return `${total} min`;
      }
    }

    return 'Duración desconocida';
  }

  getServicios(cita: Cita): string {
  if (!cita?.servicios?.length) return 'N/A';

  return cita.servicios
    .map((s) => {
      if (typeof s === 'string') {
        return `ID:${s.substring(0, 6)}`;
      }
      return s?.nombre || '';
    })
    .filter((nombre: string) => nombre)
    .join(', ') || 'N/A';
}

private formatDuracion(minutos: number): string {
  if (!minutos || minutos <= 0) return 'N/A';

  // Si es menor a 60 minutos, muestra en minutos
  if (minutos < 60) {
    return `${minutos} min`;
  }

  // Si es 60 o más, muestra en formato hora:minutos
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  if (mins === 0) {
    // Ejemplo: "1 hr" o "2 hrs"
    return `${horas} ${horas === 1 ? 'hr' : 'hrs'}`;
  }

  const hStr = horas.toString();
  const mStr = mins.toString().padStart(2, '0');
  return `${hStr}:${mStr} hrs`;
}

  getServiciosTooltip(cita: any): string {
    return `📌 Servicios: ${this.getServicios(cita)}\n⏱️ Duración real: ${this.formatDuracion(cita?.duracionRealMin || 0)}`;
  }


  cancelarCita(cita: any): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Cancelar cita',
          message: `¿Seguro deseas cancelar la cita de ${cita.clienteNombre}?`,
          confirmText: 'Cancelar cita',
          cancelText: 'Volver'
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.citaService.cancelarCita(String(cita.id)).subscribe({
        next: () => {
          this.snack.open('❌ Cita cancelada', 'Cerrar', { duration: 3500 });
          this.cargarCitas();
        },
        error: (err) => {
          const msg = err?.error?.mensaje || err.message || 'Error al cancelar cita';
          this.snack.open(`⚠️ ${msg}`, 'Cerrar', { duration: 3500 });
        }
      });
    });
  }
}
