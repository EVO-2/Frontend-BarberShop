import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { SedeService, Sede } from 'src/app/core/services/sede.service';
import { SedeDialogComponent } from 'src/app/shared/components/sede-dialog/sede-dialog.component';

@Component({
  selector: 'app-sedes',
  templateUrl: './sedes.component.html',
  styleUrls: ['./sedes.component.scss']
})
export class SedesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'nombre', 'direccion', 'telefono', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Sede>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private sedeService: SedeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /** 🔹 Cargar listado de sedes */
  cargarSedes(): void {
    this.sedeService.obtenerSedes().subscribe({
      next: (sedes: Sede[]) => {
        this.dataSource.data = sedes;
      },
      error: (err) => {
        console.error('❌ Error al cargar sedes:', err);
        this.snackBar.open('Error al cargar sedes', 'Cerrar', { duration: 3000 });
      },
    });
  }

  /** 🔹 Filtro en la tabla */
  aplicarFiltro(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filtro;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  /** 🔹 Abrir diálogo para crear o editar sede */
  abrirDialog(sede?: Sede): void {
    const dialogRef = this.dialog.open(SedeDialogComponent, {
      width: '500px',
      data: sede ? sede : null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        const mensaje = sede
          ? 'Sede actualizada correctamente'
          : 'Sede creada correctamente';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.cargarSedes();
      }
    });
  }

  /** 🔹 Cambiar estado de sede */
  cambiarEstado(sede: Sede): void {
    if (!sede._id) return;

    const nuevoEstado = !sede.estado;
    this.sedeService.actualizarEstado(sede._id, nuevoEstado).subscribe({
      next: () => {
        sede.estado = nuevoEstado;
        this.snackBar.open(
          `Sede ${nuevoEstado ? 'activada' : 'desactivada'}`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error('❌ Error al cambiar estado de la sede:', err);
        this.snackBar.open('Error al cambiar estado de la sede', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
}
