import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CitaService } from 'src/app/shared/services/cita.service';
import { MatDialog } from '@angular/material/dialog';
import { CitaUpdateDialogComponent } from 'src/app/pages/citas/cita-update-dialog/cita-update-dialog.component';
import { PagoDialogComponent } from 'src/app/pages/citas/pago-dialog/pago-dialog.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth/auth.service';
import { PusherService } from 'src/app/services/pusher.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-citas',
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.scss']
})
export class MisCitasComponent implements OnInit, OnDestroy {

  private pusherSubs: Subscription[] = [];

  cargando: boolean = true;

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

  displayedColumns: string[] = [
    'fecha',
    'turno',
    'profesional',
    'servicios',
    'estado',
    'acciones'
  ];

  constructor(
    private citaService: CitaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private pusherService: PusherService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.obtenerRol();
    this.cargarCitas();


    // Escuchar cambios de estado en tiempo real
    this.pusherSubs.push(
      this.pusherService.citaActualizada$.subscribe((data: any) => {
        if (data && data.cita) {
          const citaData = data.cita;
          const index = this.citas.findIndex(c => c._id === (citaData._id || citaData.id));
          if (index !== -1) {
            this.citas[index] = { ...this.citas[index], ...citaData };
            this.citasFiltradas = [...this.citas];
            this.cd.detectChanges();
          }
        } else if (data && data.citaId && data.nuevoEstado) {
          const index = this.citas.findIndex(c => c._id === data.citaId);
          if (index !== -1) {
            this.citas[index].estado = data.nuevoEstado;
            this.citasFiltradas = [...this.citas];
            this.cd.detectChanges();
          } else {
            this.cargarCitas();
          }
        } else {
          this.cargarCitas();
        }
      })
    );

    // Escuchar pagos reportados para actualizar el estado
    this.pusherSubs.push(
      this.pusherService.pagoReportado$.subscribe((data: any) => {
        if (data && data.citaId) {
          const index = this.citas.findIndex(c => c._id === data.citaId);
          if (index !== -1) {
            if (!this.citas[index].pago) {
              this.citas[index].pago = {};
            }
            this.citas[index].pago.estado = 'reportado';
            this.citasFiltradas = [...this.citas];
            this.cd.detectChanges();
            
            // Reproducir sonido de notificación
            const audio = new Audio('assets/sounds/notification.mp3');
            audio.play().catch(e => console.warn('No se pudo reproducir el sonido automáticamente', e));
            
            this.snackBar.open('💰 ' + (data.mensaje || '¡Nuevo comprobante de pago recibido!'), 'Cerrar', { duration: 5000 });
          } else {
            this.cargarCitas();
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.pusherSubs.forEach(sub => sub.unsubscribe());
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

  get totalComisiones(): number {
    if (!this.citasFiltradas) return 0;
    return this.citasFiltradas.reduce((acc, cita) => {
      if (cita.estado === 'pagada' && cita.comisionPeluquero) {
        return acc + cita.comisionPeluquero;
      }
      return acc;
    }, 0);
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

    const dialogRef = this.dialog.open(PagoDialogComponent, { width: '400px', data: { cita, userRole: this.userRole } });
    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado?.pagado || resultado?.reportado) {
        const index = this.citas.findIndex(c => c._id === cita._id);
        if (index >= 0) {
          if (resultado.cita) {
            this.citas[index] = { ...this.citas[index], ...resultado.cita, fechaFormateada: this.formatFechaHora(resultado.cita.fechaInicio || resultado.cita.fecha) };
          } else {
            this.citas[index].pago = resultado.pago;
            if (resultado.pagado) this.citas[index].estado = 'pagada';
          }
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

  calificarCita(cita: any): void {
    if (cita.calificacion) {
      this.snackBar.open('Esta cita ya fue calificada.', 'Cerrar', { duration: 3000 });
      return;
    }

    let calificacionSeleccionada = 0;

    Swal.fire({
      title: 'Califica tu servicio',
      html: `
        <div class="rating-container">
          <p style="margin-bottom: 15px; color: #555;">¿Qué tal fue tu experiencia con <b>${cita.peluquero?.usuario?.nombre || 'el profesional'}</b>?</p>
          <div class="stars" style="font-size: 45px; color: #ddd; cursor: pointer; display: flex; justify-content: center; gap: 10px;">
            <span class="star" data-value="1">★</span>
            <span class="star" data-value="2">★</span>
            <span class="star" data-value="3">★</span>
            <span class="star" data-value="4">★</span>
            <span class="star" data-value="5">★</span>
          </div>
          <textarea id="swal-comentario" class="swal2-textarea" placeholder="Déjanos un comentario (opcional)..." style="margin-top: 20px; width: 90%; font-size: 15px;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar Calificación',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      didOpen: () => {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
          star.addEventListener('click', (e: any) => {
            calificacionSeleccionada = parseInt(e.target.getAttribute('data-value'), 10);
            stars.forEach((s: any, index) => {
              if (index < calificacionSeleccionada) {
                s.style.color = '#ffc107';
                s.style.transform = 'scale(1.2)';
                s.style.transition = 'all 0.2s';
              } else {
                s.style.color = '#ddd';
                s.style.transform = 'scale(1)';
              }
            });
            // Reset transform after animation
            setTimeout(() => {
              stars.forEach((s: any) => s.style.transform = 'scale(1)');
            }, 200);
          });
        });
      },
      preConfirm: () => {
        if (calificacionSeleccionada === 0) {
          Swal.showValidationMessage('Por favor selecciona al menos 1 estrella.');
          return false;
        }
        const comentario = (document.getElementById('swal-comentario') as HTMLTextAreaElement).value;
        return { calificacion: calificacionSeleccionada, comentario_calificacion: comentario };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          title: 'Enviando calificación...',
          text: 'Por favor, espera.',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        this.citaService.calificarCita(cita._id, result.value.calificacion, result.value.comentario_calificacion).subscribe({
          next: (res) => {
            Swal.close();
            this.snackBar.open('¡Gracias por tu calificación!', 'Cerrar', { duration: 4000 });
            const index = this.citas.findIndex(c => c._id === cita._id);
            if (index !== -1) {
              this.citas[index].calificacion = result.value.calificacion;
              this.citas[index].comentario_calificacion = result.value.comentario_calificacion;
              this.citasFiltradas = [...this.citas];
              this.cd.detectChanges();
            }
          },
          error: (err) => {
            Swal.close();
            this.snackBar.open(err.error?.mensaje || 'Error al enviar la calificación.', 'Cerrar', { duration: 4000 });
          }
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
