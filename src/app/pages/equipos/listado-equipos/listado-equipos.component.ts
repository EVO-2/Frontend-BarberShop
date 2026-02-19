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

  displayedColumns: string[] = ['nombre', 'tipo', 'estado', 'sede', 'acciones'];
  dataSource = new MatTableDataSource<Equipo>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filtros = { tipo: '', estado: '', sede: '' };
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

  // ------------------------------
  // Configurar filtro personalizado
  // ------------------------------
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

  // ------------------------------
  // Cargar equipos manteniendo filtros y paginador
  // ------------------------------
  cargarEquipos(irAlInicio: boolean = false): void {
    const paginaActual = this.paginator?.pageIndex || 0;

    this.equipoService.listar().subscribe({
      next: resp => {
        this.dataSource.data = resp.data;

        // Reaplicar filtros sin resetear paginador
        this.aplicarFiltros(false);

        // Restaurar la página actual o ir al inicio si es creación
        if (this.paginator) {
          this.paginator.pageIndex = irAlInicio ? 0 : paginaActual;
        }
      },
      error: () => console.error('Error cargando equipos')
    });
  }

  // ------------------------------
  // Aplicar filtros
  // ------------------------------
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

  verMovimientos(equipoId: string): void {
    this.dialog.open(MovimientosEquipoDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { equipoId }
    });
  }

  // ------------------------------
  // Abrir dialog Crear/Editar equipo
  // ------------------------------
  abrirDialog(equipo?: Equipo): void {
    const dialogRef = this.dialog.open(EquipoDialogComponent, {
      width: '500px',
      data: { equipo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si es creación, ir al inicio de la tabla
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

  eliminarEquipo(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { titulo: 'Eliminar equipo', mensaje: '¿Deseas dar de baja este equipo?' }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      this.equipoService.desactivar(id).subscribe({
        next: () => this.cargarEquipos(),
        error: () => console.error('Error dando de baja equipo')
      });
    });
  }

  getNombreSede(sede: Sede | string | undefined): string {
    if (!sede) return 'Sin sede';
    if (typeof sede === 'string') return sede;
    return sede.nombre || 'Sin sede';
  }
}
