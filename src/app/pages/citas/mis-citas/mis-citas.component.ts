import { Component, OnInit } from '@angular/core';
import { CitaService } from 'src/app/shared/services/cita.service';
import { MatDialog } from '@angular/material/dialog';
import { CitaUpdateDialogComponent } from 'src/app/pages/citas/cita-update-dialog/cita-update-dialog.component';
import { PagoDialogComponent } from 'src/app/pages/citas/pago-dialog/pago-dialog.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-mis-citas',
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.scss']
})
export class MisCitasComponent implements OnInit {

  citas: any[] = [];
  citasFiltradas: any[] = [];
  sinCitas: boolean = false;

  paginaActual: number = 0;
  tamanoPagina: number = 10;
  totalCitas: number = 0;
  totalPaginas: number = 0;

  filtroFecha: Date | null = null;
  filtroGeneral: string = '';

  userRole: string = '';

  constructor(
    private citaService: CitaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.obtenerRol();
    this.cargarCitas();
  }

  formatFechaHora(fechaStr: string | Date): string {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    const opcionesFecha: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const opcionesHora: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    return `${fecha.toLocaleDateString('es-CO', opcionesFecha)} ${fecha.toLocaleTimeString('es-CO', opcionesHora)}`;
  }

  cargarCitas(): void {
    this.citaService.obtenerMisCitas(
      this.paginaActual + 1,
      this.tamanoPagina,
      this.filtroFecha ? this.filtroFecha.toISOString() : undefined,
      this.userRole,
      this.filtroGeneral ? this.filtroGeneral : undefined
    ).subscribe({
      next: (resp) => {
        this.totalCitas = resp.total || 0;
        this.totalPaginas = resp.totalPages || 0;

        const citasOrdenadas = (resp.citas || []).slice().sort((a: any, b: any) =>
          new Date(b.fechaInicio || b.fecha).getTime() - new Date(a.fechaInicio || a.fecha).getTime()
        );

        this.citas = citasOrdenadas.map((c: any) => ({
          ...c,
          fechaFormateada: this.formatFechaHora(c.fechaInicio || c.fecha),
          sede: c.sede?._id ? c.sede : { _id: c.sede, nombre: 'Desconocida' },
          peluquero: c.peluquero?._id
            ? { ...c.peluquero, usuario: { nombre: c.peluquero.usuario?.nombre || c.peluquero.nombre || 'Desconocido' } }
            : { _id: c.peluquero, usuario: { nombre: 'Desconocido' } },
          puestoTrabajo: c.puestoTrabajo?._id ? c.puestoTrabajo : { _id: c.puestoTrabajo, nombre: 'Desconocido' }
        }));

        this.sinCitas = this.citas.length === 0;
        this.citasFiltradas = [...this.citas];
      },
      error: () => {
        this.sinCitas = true;
      }
    });
  }

  getServicios(cita: any): string {
    if (!cita?.servicios?.length) return '';
    return cita.servicios.map((s: any) => s?.nombre || '').join(', ');
  }

  abrirPagoDialog(cita: any): void {
    if (cita.estado === 'cancelada') {
      alert('❌ No se puede realizar el pago de una cita cancelada');
      return;
    }

    const dialogRef = this.dialog.open(PagoDialogComponent, { width: '400px', data: { cita } });
    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado?.pagado) {
        const index = this.citas.findIndex(c => c._id === cita._id);
        if (index >= 0) {
          this.citas[index].pago = resultado.pago;
          this.citas[index].estado = 'pagado';
          this.citas[index].fechaFormateada = this.formatFechaHora(this.citas[index].fechaInicio || this.citas[index].fecha);
        }
        this.citasFiltradas = [...this.citas].sort((a, b) =>
          new Date(b.fechaInicio || b.fecha).getTime() - new Date(a.fechaInicio || a.fecha).getTime()
        );
      }
    });
  }

  editarCita(cita: any): void {
    const dialogRef = this.dialog.open(CitaUpdateDialogComponent, { width: '450px', data: cita, autoFocus: false });

    dialogRef.afterClosed().subscribe((citaActualizada) => {
      if (citaActualizada) {
        const index = this.citas.findIndex(c => c._id === citaActualizada._id);
        if (index !== -1) {
          this.citas[index] = {
            ...citaActualizada,
            fechaFormateada: this.formatFechaHora(citaActualizada.fechaInicio || citaActualizada.fecha)
          };
        } else {
          this.citas.push({
            ...citaActualizada,
            fechaFormateada: this.formatFechaHora(citaActualizada.fechaInicio || citaActualizada.fecha)
          });
        }

        this.citasFiltradas = [...this.citas].sort((a, b) =>
          new Date(b.fechaInicio || b.fecha).getTime() - new Date(a.fechaInicio || a.fecha).getTime()
        );

        this.snackBar.open('✅ Tu cita fue reprogramada correctamente', 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  cambiarPagina(event: PageEvent): void {
    this.paginaActual = event.pageIndex;
    this.tamanoPagina = event.pageSize;
    this.cargarCitas();
  }

  onFiltroGeneralChange(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.filtroGeneral = value.toLowerCase().trim();
    this.paginaActual = 0;
    this.cargarCitas();
  }

  onFechaChange(event: MatDatepickerInputEvent<Date>): void {
    this.filtroFecha = event.value ?? null;
    this.paginaActual = 0;
    this.cargarCitas();
  }

  limpiarFiltros(): void {
    this.filtroFecha = null;
    this.filtroGeneral = '';
    this.paginaActual = 0;
    this.cargarCitas();
  }

  esHoy(fechaStr: string | Date): boolean {
    if (!fechaStr) return false;
    const fechaCita = new Date(fechaStr);
    const hoy = new Date();
    return fechaCita.getFullYear() === hoy.getFullYear() &&
           fechaCita.getMonth() === hoy.getMonth() &&
           fechaCita.getDate() === hoy.getDate();
  }
}
