import { Component, OnInit } from '@angular/core';
import { CitaService } from 'src/app/shared/services/cita.service';
import { MatDialog } from '@angular/material/dialog';
import { CitaUpdateDialogComponent } from 'src/app/pages/citas/cita-update-dialog/cita-update-dialog.component';
import { PagoDialogComponent } from 'src/app/pages/citas/pago-dialog/pago-dialog.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-mis-citas',
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.scss']
})
export class MisCitasComponent implements OnInit {

  // Datos
  citas: any[] = [];
  citasFiltradas: any[] = [];

  // Paginación con MatPaginator
  paginaActual: number = 0;   
  tamanoPagina: number = 10;  
  totalCitas: number = 0;    

  // Filtros
  filtroFecha: Date | null = null;
  filtroGeneral: string = '';

  constructor(
    private citaService: CitaService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  // Cargar citas del usuario
  cargarCitas(): void {
    this.citaService.obtenerMisCitas().subscribe({
      next: (resp) => {
        this.citas = (resp.citas || []).map((c: any) => ({
          ...c,
          sede: c.sede?._id ? c.sede : { _id: c.sede, nombre: 'Desconocida' },
          peluquero: c.peluquero?._id ? c.peluquero : { _id: c.peluquero, usuario: { nombre: 'Desconocido' } },
          puestoTrabajo: c.puestoTrabajo?._id ? c.puestoTrabajo : { _id: c.puestoTrabajo, nombre: 'Desconocido' }
        }));

        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('❌ Error al cargar citas:', err);
      }
    });
  }

  // Nombres de servicios
  getServicios(cita: any): string {
    if (!cita?.servicios?.length) return '';
    return cita.servicios.map((s: any) => s?.nombre || '').join(', ');
  }

  // 🔹 Método para abrir el diálogo de pago
  abrirPagoDialog(cita: any): void {
    if (cita.estado === 'cancelada') {
      alert('❌ No se puede realizar el pago de una cita cancelada');
      return;
    }

    const dialogRef = this.dialog.open(PagoDialogComponent, {
      width: '400px',
      data: { cita }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado?.pagado) {
        const index = this.citas.findIndex(c => c._id === cita._id);
        if (index >= 0) {
          this.citas[index].pago = resultado.pago;
          this.citas[index].estado = 'pagado';
          this.citasFiltradas = [...this.citas];
        }
      }
    });
  }


  // Editar cita
  editarCita(cita: any): void {
    const dialogRef = this.dialog.open(CitaUpdateDialogComponent, {
      width: '450px',
      data: cita
    });

    dialogRef.afterClosed().subscribe((citaActualizada) => {
      if (citaActualizada) {
        const index = this.citas.findIndex(c => c._id === citaActualizada._id);
        if (index !== -1) {
          this.citas[index] = citaActualizada;
        }
        this.aplicarFiltros();
      }
    });
  }

  abrirPago(cita: any): void {
  const dialogRef = this.dialog.open(PagoDialogComponent, {
    width: '400px',
    data: { cita }
  });

  dialogRef.afterClosed().subscribe(resultado => {
    if (resultado?.pagado) {
      const index = this.citas.findIndex(c => c._id === cita._id);
      if (index !== -1) {
        this.citas[index].pago = resultado.pago;
        this.citas[index].estado = 'pagado';
      }
      this.aplicarFiltros();
    }
  });
}


  // 🔹 Manejo de eventos de paginador
  cambiarPagina(event: PageEvent): void {
    this.paginaActual = event.pageIndex;
    this.tamanoPagina = event.pageSize;
    this.aplicarFiltros();
  }

  /* =========================
     Manejo de filtros
     ========================= */

  onFiltroGeneralChange(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.filtroGeneral = value.toLowerCase().trim();
    this.aplicarFiltros();
  }

  onFechaChange(event: MatDatepickerInputEvent<Date>): void {
    this.filtroFecha = event.value ?? null;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroFecha = null;
    this.filtroGeneral = '';
    this.paginaActual = 0; 
    this.aplicarFiltros();
  }
  

  aplicarFiltros(): void {
    const fechaFiltro = this.filtroFecha ? new Date(
      this.filtroFecha.getFullYear(),
      this.filtroFecha.getMonth(),
      this.filtroFecha.getDate(), 0, 0, 0, 0
    ) : null;

    let filtradas = (this.citas || []).filter((c: any) => {
      const clienteNombre = (c?.cliente?.usuario?.nombre || '').toLowerCase();
      const barberoNombre = (c?.peluquero?.usuario?.nombre || '').toLowerCase();
      const sedeNombre = (c?.sede?.nombre || '').toLowerCase();
      const estado = (c?.estado || '').toLowerCase();
      const turnoStr = c?.turno != null ? String(c.turno) : '';
      const serviciosNombres = (c?.servicios || []).map((s: any) => s?.nombre || '').join(' ').toLowerCase();

      // Filtro específico: fecha
      if (fechaFiltro) {
        const fechaCita = c?.fecha ? new Date(c.fecha) : null;
        if (!fechaCita) return false;

        const fechaCitaSoloDia = new Date(
          fechaCita.getFullYear(),
          fechaCita.getMonth(),
          fechaCita.getDate(), 0, 0, 0, 0
        );

        if (fechaCitaSoloDia.getTime() !== fechaFiltro.getTime()) return false;
      }

      // Filtro general
      if (this.filtroGeneral) {
        const blob = [
          clienteNombre,
          barberoNombre,
          sedeNombre,
          estado,
          turnoStr.toLowerCase(),
          serviciosNombres,
          c?.fecha ? new Date(c.fecha).toLocaleString().toLowerCase() : ''
        ].join(' ');
        if (!blob.includes(this.filtroGeneral)) return false;
      }

      return true;
    });

    // Guardar total para el paginador
    this.totalCitas = filtradas.length;

    // Paginación real
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.citasFiltradas = filtradas.slice(inicio, fin);
  }
}
