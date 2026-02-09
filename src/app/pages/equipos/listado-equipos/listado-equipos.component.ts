import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { EquipoService } from 'src/app/core/services/equipo.service';
import { SedeService } from 'src/app/core/services/sede.service';

import { Equipo } from 'src/app/shared/models/equipo.model';
import { Sede } from 'src/app/shared/models/sede.model';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MovimientosEquipoDialogComponent } from '../movimientos-equipo-dialog/movimientos-equipo-dialog.component';

@Component({
  selector: 'app-listado-equipos',
  templateUrl: './listado-equipos.component.html',
  styleUrls: ['./listado-equipos.component.scss']
})
export class ListadoEquiposComponent implements OnInit {

  displayedColumns: string[] = [
    'nombre',
    'tipo',
    'estado',
    'sede',
    'acciones',
  ];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filtros = {
    tipo: '',
    estado: '',
    sede: ''
  };

  tipos: string[] = ['maquina', 'silla', 'secador', 'otro'];
  estados: string[] = ['activo', 'mantenimiento', 'dañado'];

  sedes: Sede[] = [];

  constructor(
    private sedeService: SedeService,
    private equipoService: EquipoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarEquipos();
  }

  // --------------------------------------
  // Cargar sedes
  // --------------------------------------
  cargarSedes() {
    this.sedeService.obtenerSedes().subscribe({
      next: (resp) => this.sedes = resp,
      error: (err) => console.log('Error cargando sedes', err)
    });
  }

  // --------------------------------------
  // Cargar equipos
  // --------------------------------------
  cargarEquipos() {
    this.equipoService.listar().subscribe({
      next: (resp: any) => {
        this.dataSource = new MatTableDataSource(resp.data);
        this.dataSource.paginator = this.paginator;
      },
      error: (err: any) => console.log('Error cargando equipos', err)
    });
  }

  // --------------------------------------
  // Aplicar filtros
  // --------------------------------------
  aplicarFiltros() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filtros = JSON.parse(filter);

      return (
        (filtros.tipo ? data.tipo === filtros.tipo : true) &&
        (filtros.estado ? data.estado === filtros.estado : true) &&
        (filtros.sede ? data.sede?._id === filtros.sede : true)
      );
    };

    this.dataSource.filter = JSON.stringify(this.filtros);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // --------------------------------------
  // Limpiar filtros
  // --------------------------------------
  limpiarFiltros() {
    this.filtros = { tipo: '', estado: '', sede: '' };
    this.aplicarFiltros();
  }

  // --------------------------------------
  // ▶️ VER MOVIMIENTOS (Abrir dialog)
  // --------------------------------------
  verMovimientos(equipoId: string) {
    this.dialog.open(MovimientosEquipoDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { equipoId }
    });
  }

  // --------------------------------------
  // Editar equipo
  // --------------------------------------
  editarEquipo(row: any) {
    console.log('Editar equipo:', row);
  }

  // --------------------------------------
  // Eliminar equipo
  // --------------------------------------
  eliminarEquipo(id: string) {
    console.log('Eliminar equipo:', id);
  }
}
