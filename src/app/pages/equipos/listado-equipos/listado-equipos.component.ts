import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { EquipoService } from 'src/app/core/services/equipo.service';
import { SedeService } from 'src/app/core/services/sede.service';

import { Equipo } from 'src/app/shared/models/equipo.model';
import { Sede } from 'src/app/shared/models/sede.model';

import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MovimientosEquipoDialogComponent } from '../movimientos-equipo-dialog/movimientos-equipo-dialog.component';
import { EquipoDialogComponent } from '../equipo-dialog/equipo-dialog.component';

@Component({
  selector: 'app-listado-equipos',
  templateUrl: './listado-equipos.component.html',
  styleUrls: ['./listado-equipos.component.scss']
})
export class ListadoEquiposComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'nombre',
    'tipo',
    'estado',
    'sede',
    'puesto',
    'asignadoA',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Equipo>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = false;
  animatingId: string | null = null;

  filtros = { tipo: '', estado: '', sede: '' };
  filtroActivo: 'activos' | 'inactivos' | 'todos' = 'activos';

  tipos: string[] = ['maquina', 'silla', 'secador', 'otro'];
  estados: string[] = ['activo', 'en_mantenimiento', 'dañado', 'fuera_de_servicio', 'retirado'];
  sedes: Sede[] = [];

  constructor(
    private sedeService: SedeService,
    private equipoService: EquipoService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarEquipos();
    this.configurarFiltro();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // =====================================
  // FILTRO PERSONALIZADO
  // =====================================
  private configurarFiltro(): void {
    this.dataSource.filterPredicate = (data: Equipo, filter: string) => {
      const filtros = JSON.parse(filter);
      const sedeId = typeof data.sede === 'string' ? data.sede : data.sede?._id;

      return (
        (!filtros.tipo || data.tipo === filtros.tipo) &&
        (!filtros.estado || data.estado === filtros.estado) &&
        (!filtros.sede || sedeId === filtros.sede)
      );
    };
  }

  private cargarSedes(): void {
    this.sedeService.obtenerSedes().subscribe({
      next: resp => this.sedes = resp,
      error: () => console.error('Error cargando sedes')
    });
  }

  // =====================================
  // CARGAR EQUIPOS
  // =====================================
  cargarEquipos(irAlInicio: boolean = false): void {

    this.loading = true;

    const paginaActual = this.paginator?.pageIndex || 0;

    let activoParam: boolean | undefined;

    if (this.filtroActivo === 'activos') activoParam = true;
    else if (this.filtroActivo === 'inactivos') activoParam = false;
    else activoParam = undefined;

    this.equipoService.listar({ activo: activoParam }).subscribe({
      next: resp => {
        this.dataSource.data = resp.data;
        this.aplicarFiltros(false);

        if (this.paginator) {
          this.paginator.pageIndex = irAlInicio ? 0 : paginaActual;
        }

        this.loading = false;
      },
      error: () => {
        console.error('Error cargando equipos');
        this.loading = false;
      }
    });
  }

  // =====================================
  // FILTROS LOCALES
  // =====================================
  aplicarFiltros(resetPaginator: boolean = true): void {
    this.dataSource.filter = JSON.stringify(this.filtros);

    if (resetPaginator && this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  limpiarFiltros(): void {
    this.filtros = { tipo: '', estado: '', sede: '' };
    this.aplicarFiltros();
  }

  // =====================================
  // MOVIMIENTOS
  // =====================================
  verMovimientos(equipoId: string): void {
    this.dialog.open(MovimientosEquipoDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { equipoId }
    });
  }

  // =====================================
  // CREAR / EDITAR
  // =====================================
  abrirDialog(equipo?: Equipo): void {
    const dialogRef = this.dialog.open(EquipoDialogComponent, {
      width: '500px',
      data: { equipo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const esCreacion = !equipo;
        this.cargarEquipos(esCreacion);
      }
    });
  }

  editarEquipo(equipo: Equipo): void {
    this.abrirDialog(equipo);
  }

  crearEquipo(): void {
    this.abrirDialog();
  }

  // =====================================
  // CAMBIAR ESTADO (ACTIVO / INACTIVO)
  // =====================================
  toggleEstado(equipo: Equipo): void {

    const nuevoEstado = !equipo.activo;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: nuevoEstado ? 'Reactivar equipo' : 'Dar de baja equipo',
        mensaje: nuevoEstado
          ? '¿Deseas reactivar este equipo?'
          : '¿Deseas dar de baja este equipo?'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;

      this.animatingId = equipo._id!;

      this.equipoService
        .cambiarEstado(equipo._id!, nuevoEstado)
        .subscribe({
          next: (equipoActualizado) => {

            const index = this.dataSource.data.findIndex(e => e._id === equipo._id);

            if (index !== -1) {
              this.dataSource.data[index].activo = equipoActualizado.activo;
              this.dataSource.data[index].estado = equipoActualizado.estado;
              this.dataSource._updateChangeSubscription();
            }

            if (
              (this.filtroActivo === 'activos' && !nuevoEstado) ||
              (this.filtroActivo === 'inactivos' && nuevoEstado)
            ) {
              this.dataSource.data = this.dataSource.data.filter(
                e => e._id !== equipo._id
              );
            }

            this.animatingId = null;
          },
          error: () => {
            console.error('Error cambiando estado del equipo');
            this.animatingId = null;
          }
        });
    });
  }

  // =====================================
  // HELPERS VISUALES DE ESTADO
  // =====================================
  getEstadoTexto(equipo: Equipo): string {
    switch (equipo.estado) {
      case 'activo': return 'Activo';
      case 'en_mantenimiento': return 'En mantenimiento';
      case 'dañado': return 'Dañado';
      case 'fuera_de_servicio': return 'Fuera de servicio';
      case 'retirado': return 'Retirado';
      default: return '';
    }
  }

  getEstadoIcon(equipo: Equipo): string {
    switch (equipo.estado) {
      case 'activo': return 'check_circle';
      case 'en_mantenimiento': return 'build';
      case 'dañado': return 'warning';
      case 'fuera_de_servicio': return 'highlight_off';
      case 'retirado': return 'delete';
      default: return 'help';
    }
  }

  getEstadoClass(equipo: Equipo): string {
    switch (equipo.estado) {
      case 'activo': return 'activo';
      case 'en_mantenimiento': return 'en_mantenimiento';
      case 'dañado': return 'dañado';
      case 'fuera_de_servicio': return 'fuera_de_servicio';
      case 'retirado': return 'retirado';
      default: return '';
    }
  }

  getEstadoTooltip(equipo: Equipo): string {
    return `Estado actual: ${this.getEstadoTexto(equipo)}`;
  }

  // =====================================
  // HELPERS PARA MOSTRAR NOMBRES
  // =====================================
  obtenerNombreSede(row: Equipo): string {
    if (!row?.sede) return 'Sin sede';

    return typeof row.sede === 'object'
      ? row.sede.nombre || 'Sin sede'
      : 'Sin sede';
  }

  obtenerNombrePuesto(row: Equipo): string {
    if (!row?.puesto) return 'Sin puesto';

    return typeof row.puesto === 'object'
      ? row.puesto.nombre || 'Sin puesto'
      : 'Sin puesto';
  }

  obtenerResponsable(row: Equipo): string {

    const nombre =
      row?.puesto &&
      typeof row.puesto === 'object' &&
      (row.puesto as any)?.peluquero?.usuario?.nombre;

    return nombre || 'Sin usuario';
  }

}

