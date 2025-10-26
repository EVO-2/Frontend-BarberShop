import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiciosService, Servicio } from 'src/app/core/services/servicios.service';
import { ServicioCardDialogComponent } from 'src/app/shared/components/servicio-card-dialog/servicio-card-dialog.component';
import { ServicioDialogComponent } from 'src/app/shared/components/servicio-dialog/servicio-dialog.component';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.scss']
})
export class ServiciosComponent implements OnInit {
  servicios: Servicio[] = [];
  displayedColumns: string[] = ['#', 'nombre', 'duracion', 'precio', 'estado', 'acciones'];
  cargando = false;

  constructor(
    private serviciosService: ServiciosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  /** ================== CICLO DE VIDA ================== */
  ngOnInit(): void {
    this.obtenerServicios();
  }

  /** ================== OBTENER SERVICIOS ================== */
  obtenerServicios(): void {
    this.cargando = true;
    this.serviciosService.obtenerServicios().subscribe({
      next: (data) => {
        this.servicios = Array.isArray(data) ? data : data?.servicios || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('Error al cargar los servicios', 'Cerrar', {
          duration: 3000,
          panelClass: ['snack-error']
        });
      }
    });
  }

  /** ================== CREAR NUEVO SERVICIO ================== */
  crearServicio(): void {
    (document.activeElement as HTMLElement)?.blur();

    const dialogRef = this.dialog.open(ServicioDialogComponent, {
      width: '900px',
      data: { modoEdicion: false }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (!resultado) return;

      const formData = new FormData();
      formData.append('nombre', resultado.nombre?.trim() || '');
      formData.append('descripcion', resultado.descripcion?.trim() || '');
      formData.append('duracion', resultado.duracion?.toString() || '0');
      formData.append('precio', resultado.precio?.toString() || '0');
      formData.append('estado', resultado.estado?.toString() || 'true');

      if (Array.isArray(resultado.imagenes) && resultado.imagenes.length > 0) {
        resultado.imagenes.forEach((file: File) => {
          if (file instanceof File) formData.append('imagenes', file);
        });
      }

      this.serviciosService.crearServicio(formData).subscribe({
        next: (respuesta) => {
          const nuevoServicio = respuesta.data;
          this.servicios = [nuevoServicio, ...this.servicios];
          this.snackBar.open('✅ Servicio creado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['snack-success']
          });
        },
        error: () => {
          this.snackBar.open('❌ Error al crear el servicio', 'Cerrar', {
            duration: 3000,
            panelClass: ['snack-error']
          });
        }
      });
    });
  }

  /** ================== ABRIR DETALLES ================== */
  abrirDetalles(servicio: Servicio): void {
    const data = {
      _id: servicio._id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion: servicio.duracion,
      precio: servicio.precio,
      imagenes: servicio.imagenes,
      estado: servicio.estado
    };

    this.dialog.open(ServicioCardDialogComponent, {
      width: '900px',
      data
    });
  }

  /** ================== EDITAR SERVICIO ================== */
  editarServicio(servicio: Servicio): void {
    (document.activeElement as HTMLElement)?.blur();

    const dialogRef = this.dialog.open(ServicioDialogComponent, {
      width: '900px',
      data: { ...servicio, modoEdicion: true }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        const formData = new FormData();
        formData.append('nombre', resultado.nombre || '');
        formData.append('descripcion', resultado.descripcion || '');
        formData.append('precio', resultado.precio);
        formData.append('duracion', resultado.duracion || '');
        formData.append('estado', resultado.estado);

        if (resultado.imagenesExistentes?.length) {
          resultado.imagenesExistentes.forEach((img: string) => {
            formData.append('imagenesExistentes[]', img);
          });
        }

        if (resultado.nuevasImagenes?.length) {
          resultado.nuevasImagenes.forEach((file: File) => {
            formData.append('imagenes', file);
          });
        }

        this.serviciosService.actualizarServicio(servicio._id!, formData).subscribe({
          next: (servicioActualizado) => {
            const index = this.servicios.findIndex(s => s._id === servicio._id);
            if (index !== -1) this.servicios[index] = servicioActualizado.data;

            this.snackBar.open('✅ Servicio actualizado correctamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['snack-success']
            });
          },
          error: () => {
            this.snackBar.open('❌ Error al actualizar el servicio', 'Cerrar', {
              duration: 3000,
              panelClass: ['snack-error']
            });
          }
        });
      }
    });
  }

  /** ================== CAMBIAR ESTADO ================== */
  cambiarEstado(servicio: Servicio): void {
    const idServicio: string | undefined = (servicio as any)._id || (servicio as any).data?._id;

    if (!idServicio) {
      this.snackBar.open('ID del servicio no definido', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-error']
      });
      return;
    }

    const nuevoEstado = !servicio.estado;

    this.serviciosService.cambiarEstadoServicio(idServicio, nuevoEstado).subscribe({
      next: () => {
        (servicio as any).estado = nuevoEstado;
        this.snackBar.open(
          `Servicio ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
          'Cerrar',
          { duration: 3000, panelClass: ['snack-success'] }
        );
      },
      error: () => {
        this.snackBar.open('Error al cambiar el estado del servicio', 'Cerrar', {
          duration: 3000,
          panelClass: ['snack-error']
        });
      }
    });
  }
}
