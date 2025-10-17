import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PuestoService } from 'src/app/core/services/puesto.service';
import { SedeService } from 'src/app/core/services/sede.service';
import { PuestoTrabajo } from 'src/app/shared/models/puesto-trabajo.model';
import { Sede } from 'src/app/shared/models/sede.model';
import { PuestoDialogComponent } from 'src/app/shared/components/puesto-dialog/puesto-dialog.component';

@Component({
  selector: 'app-gestionar-puestos',
  templateUrl: './gestionar-puestos.component.html',
  styleUrls: ['./gestionar-puestos.component.scss']
})
export class GestionarPuestosComponent implements OnInit {

  sedes: Sede[] = [];
  sedeSeleccionada: string = '';
  puestos: PuestoTrabajo[] = [];

  constructor(
    private puestoService: PuestoService,
    private sedeService: SedeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
  }

  /** Carga todas las sedes disponibles */
  cargarSedes(): void {
    this.sedeService.obtenerSedes().subscribe({
      next: (data) => this.sedes = data,
      error: () => this.mostrarMensaje('Error al cargar las sedes.')
    });
  }

  /** Carga los puestos de la sede seleccionada */
  onSedeSeleccionada(): void {
    if (!this.sedeSeleccionada) return;

    this.puestoService.getPuestosPorSede(this.sedeSeleccionada).subscribe({
      next: (data) => this.puestos = data,
      error: () => this.mostrarMensaje('Error al cargar los puestos.')
    });
  }

  /** Obtiene el nombre del peluquero asignado al puesto */
  obtenerNombrePeluquero(puesto: PuestoTrabajo): string {
    if (!puesto.peluquero) return 'No asignado';
    if (typeof puesto.peluquero === 'string') return 'No asignado';

    const p = puesto.peluquero as any;
    return (
      p.nombreCompleto ||
      `${p.usuario?.nombre || p.nombre || ''} ${p.usuario?.apellido || p.apellido || ''}`.trim() ||
      'No asignado'
    );
  }

  /** 🟢 Crear nuevo puesto (sede se asigna automáticamente) */
  abrirDialogoCrear(): void {
    if (!this.sedeSeleccionada) {
      this.mostrarMensaje('Selecciona una sede primero.');
      return;
    }

    const sedeObj = this.sedes.find(s => s._id === this.sedeSeleccionada);

    if (!sedeObj) {
      this.mostrarMensaje('No se encontró la sede seleccionada.');
      return;
    }

    const dialogRef = this.dialog.open(PuestoDialogComponent, {
      width: '500px',
      data: {
        modo: 'crear',
        sede: sedeObj
      }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.onSedeSeleccionada();
        this.mostrarMensaje('Puesto creado correctamente');
      }
    });
  }

  /** ✏️ Editar puesto (sede se envía como objeto completo) */
  abrirDialogoEditar(puesto: PuestoTrabajo): void {
    let sedeObj: any;

    if (puesto.sede && typeof puesto.sede === 'object' && puesto.sede._id) {
      sedeObj = puesto.sede;
    } else if (typeof puesto.sede === 'string' && puesto.sede.length === 24) {
      sedeObj = this.sedes.find(s => s._id === puesto.sede);
    } else if (typeof puesto.sede === 'string') {
      sedeObj = this.sedes.find(s => s.nombre === puesto.sede);
    }

    if (!sedeObj) {
      this.mostrarMensaje('No se encontró la sede asociada al puesto.');
      return;
    }

    const dialogRef = this.dialog.open(PuestoDialogComponent, {
      width: '500px',
      data: {
        modo: 'editar',
        puesto,
        sede: sedeObj
      }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.onSedeSeleccionada();
        this.mostrarMensaje('Puesto actualizado correctamente');
      }
    });
  }

  /** 🔄 Cambiar estado (activar/desactivar) */
  cambiarEstadoPuesto(puesto: PuestoTrabajo): void {
    if (!puesto._id) return;

    const nuevoEstado = !puesto.estado;

    this.puestoService.cambiarEstado(puesto._id, nuevoEstado).subscribe({
      next: () => {
        puesto.estado = nuevoEstado;
        this.mostrarMensaje(`Puesto ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
      },
      error: () => this.mostrarMensaje('Error al cambiar el estado del puesto')
    });
  }

  /** 🔔 Mostrar mensaje */
  mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
