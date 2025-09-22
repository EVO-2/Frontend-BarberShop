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
    console.log('[ngOnInit] Cargando citas iniciales');
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
    const horaActual = `${h}:${m}`;
    console.log('[obtenerHoraActual]', horaActual);
    return horaActual;
  }

  private cargarCitas(page: number = 1, filtro: string = ''): void {
  console.log('[cargarCitas] Iniciando carga de citas');
  const rol = this.auth.obtenerRol();
  const filtros: any = {};

  if (this.filtroCliente) filtros.filtroGeneral = this.filtroCliente;
  if (this.filtroFecha) {
    const yyyy = this.filtroFecha.getFullYear();
    const mm = String(this.filtroFecha.getMonth() + 1).padStart(2, '0');
    const dd = String(this.filtroFecha.getDate()).padStart(2, '0');
    filtros.fecha = `${yyyy}-${mm}-${dd}`;
  }
  filtros.rol = rol;

  this.citaService.obtenerCitasPaginadas(this.pageIndex + 1, this.pageSize, filtros).subscribe({
    next: (resp: any) => {
      const citasAdaptadas = (resp.citas || []).map((c: any) => {
        const clienteNombre = c.cliente?.usuario
          ? `${c.cliente.usuario.nombre || ''} ${c.cliente.usuario.apellido || ''}`.trim()
          : '';
        const peluqueroNombre = c.peluquero?.usuario
          ? `${c.peluquero.usuario.nombre || ''} ${c.peluquero.usuario.apellido || ''}`.trim()
          : '';

        // ⚡ Estrategia: si inicioServicio es null/undefined, usar fecha de reserva
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
          peluqueroNombre
        };
      });

      this.dataSource.data = citasAdaptadas;
      this.totalCitas = resp.total || citasAdaptadas.length;

      this.dataSource.data.forEach(cita => {
        if (!cita.inicioServicio) {
          console.warn(`[cargarCitas] La cita ${cita.id} no tiene inicioServicio definido — usando fecha de reserva`);
          cita.inicioServicio = cita.fecha; // fallback
        }
      });
    },
    error: (err: any) => {
      console.error('[cargarCitas] Error al cargar citas', err);
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
    console.log('[onPageChange] pageIndex:', this.pageIndex, 'pageSize:', this.pageSize);
    this.cargarCitas();
  }

  aplicarFiltros() {
  let filtro = this.filtroCliente || '';

  if (this.filtroFecha) {
    const fecha = new Date(this.filtroFecha);
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    filtro += (filtro ? ' ' : '') + `${yyyy}-${mm}-${dd}`;
  }

  this.cargarCitas(1, filtro); // 👈 ahora sí pasa la fecha como string
}


  limpiarFiltros(): void {
    this.filtroCliente = '';
    this.filtroFecha = null;
    console.log('[limpiarFiltros] Filtros limpiados');
    this.aplicarFiltros();
  }

  // =========================
// 🔹 Iniciar servicio
// =========================
iniciarServicio(cita: any): void {
  console.log('[iniciarServicio] Cita seleccionada', cita);

  const peluqueroId = String(this.auth.getCurrentUserId());
  if (!peluqueroId) {
    console.warn('[iniciarServicio] No se encontró peluqueroId');
    return;
  }

  const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
    ConfirmDialogComponent,
    {
      data: {
        title: 'Iniciar servicio',
        message: `¿Deseas iniciar el servicio de ${cita.clienteNombre}?`,
        confirmText: 'Iniciar',
        cancelText: 'Cancelar'
      }
    }
  );

  dialogRef.afterClosed().subscribe(result => {
    if (!result) {
      console.log('[iniciarServicio] Usuario canceló el inicio del servicio');
      return;
    }

    // ⚡ Obtener hora actual como inicio del servicio
    const horaInicio = this.obtenerHoraActual();
    console.log('[iniciarServicio] Hora de inicio calculada', horaInicio);

    this.citaService.iniciarServicio(String(cita.id), horaInicio).subscribe({
      next: (res: any) => {
        console.log('[iniciarServicio] Respuesta del servicio', res);
        this.cargarCitas();
        // ⚡ Unificar propiedades y evitar undefined
        const citaActualizada = {
          ...cita,
          inicioServicio: res.cita.inicioServicio || res.cita.inicio_servicio || horaInicio,
          finServicio: res.cita.finServicio || res.cita.fin_servicio || null,
          duracionRealMin: res.cita.duracionRealMin || res.cita.duracion_real_min || 0,
          estado: res.cita.estado || 'en_proceso',
        };

        // ⚡ Actualizar dataSource de forma reactiva
        const index = this.dataSource.data.findIndex(c => c.id === cita.id);
        if (index !== -1) {
          this.dataSource.data[index] = citaActualizada;
          this.dataSource.data = [...this.dataSource.data]; // ✅ Forzar refresco
          console.log('[iniciarServicio] dataSource actualizado correctamente', this.dataSource.data[index]);
        } else {
          console.warn('[iniciarServicio] No se encontró la cita en dataSource, agregando como nueva');
          this.dataSource.data = [...this.dataSource.data, citaActualizada]; // ✅ Forzar refresco con push
        }

        this.snack.open('✅ Servicio iniciado', 'Cerrar', { duration: 3500 });
      },
      error: (err: any) => {
        console.error('[iniciarServicio] Error al iniciar servicio', err);
        this.snack.open(err.error?.mensaje || `❌ Error al iniciar servicio`, 'Cerrar', { duration: 3500 });
        this.cargarCitas();
      }
    });
  });
}

 // =========================
// 🔹 Finalizar servicio
// =========================
finalizarServicio(cita: any): void {
  console.log('[finalizarServicio] Cita seleccionada:', cita);

  if (cita.estado !== 'en_proceso') {
    console.warn('[finalizarServicio] La cita no está en proceso:', cita.estado);
    this.snack.open('⚠️ La cita no está en proceso y no puede finalizarse', 'Cerrar', { duration: 3500 });
    return;
  }

  const peluqueroId = String(this.auth.getCurrentUserId());
  if (!peluqueroId) {
    console.error('[finalizarServicio] No se encontró peluqueroId');
    return;
  }

  const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
    ConfirmDialogComponent,
    {
      data: {
        title: 'Finalizar servicio',
        message: `¿Quieres finalizar el servicio de ${cita.clienteNombre}?`,
        confirmText: 'Finalizar',
        cancelText: 'Cancelar'
      }
    }
  );

  dialogRef.afterClosed().subscribe(result => {
    if (!result) {
      console.log('[finalizarServicio] Acción cancelada por el usuario');
      return;
    }

    // ⚡ Fallback para inicioServicio (solo logs)
    const inicio = cita.inicioServicio || cita.fecha || new Date().toISOString();
    const ahora = new Date();
    const horaFin = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
    console.log('[finalizarServicio] Hora de inicio (fallback):', inicio, 'Hora de fin:', horaFin);

    // ⚡ Payload opcional
    const horaPayload = horaFin && horaFin.trim() !== '' ? horaFin.trim() : undefined;

    this.citaService.finalizarServicio(String(cita.id), peluqueroId, horaPayload).subscribe({
      next: (updated: Cita) => {
        console.log('[finalizarServicio] Cita finalizada con éxito:', updated);
        this.cargarCitas();
        const index = this.dataSource.data.findIndex(c => c.id === cita.id);
        if (index !== -1) {
          this.dataSource.data[index] = { ...this.dataSource.data[index], ...updated };
          // ✅ Forzar refresco de la tabla sin recargar
          this.dataSource.data = [...this.dataSource.data];
        } else {
          console.warn('[finalizarServicio] No se encontró cita en dataSource, recargando...');
          this.cargarCitas();
        }

        const duracion = updated.duracionRealMin || 0;
        this.snack.open(`✅ Servicio finalizado — duración: ${duracion} min`, 'Cerrar', { duration: 3500 });
      },
      error: (err) => {
        console.error('[finalizarServicio] Error al finalizar cita:', err);
        this.snack.open(err.error?.mensaje || `❌ Error al finalizar servicio`, 'Cerrar', { duration: 3500 });
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
    if (cita.estado === 'finalizada') {
      if (cita.duracionRealMin != null) return `${cita.duracionRealMin} min`;
      if (cita.inicioServicio && cita.finServicio) {
        const duracion = Math.round((new Date(cita.finServicio).getTime() - new Date(cita.inicioServicio).getTime()) / 60000);
        return duracion > 0 ? `${duracion} min` : 'Duración desconocida';
      }
      return 'Duración desconocida';
    }
    return '-';
  }

  cancelarCita(cita: any): void {
    console.log('[cancelarCita] Cita seleccionada', cita);
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
          console.log('[cancelarCita] Cita cancelada correctamente');
          this.snack.open('❌ Cita cancelada', 'Cerrar', { duration: 3500 });
          this.cargarCitas();
        },
        error: (err) => {
          console.error('[cancelarCita] Error al cancelar cita', err);
          const msg = err?.error?.mensaje || err.message || 'Error al cancelar cita';
          this.snack.open(`⚠️ ${msg}`, 'Cerrar', { duration: 3500 });
        }
      });
    });
  }
}
