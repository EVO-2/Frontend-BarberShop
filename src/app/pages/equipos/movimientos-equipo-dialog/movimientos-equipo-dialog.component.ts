import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { EquipoMovimientoService } from 'src/app/core/services/equipo-movimiento.service';
import { FormControl } from '@angular/forms';
import { EquipoMovimiento } from 'src/app/shared/models/equipo-movimiento.model';

@Component({
  selector: 'app-movimientos-equipo-dialog',
  templateUrl: './movimientos-equipo-dialog.component.html',
  styleUrls: ['./movimientos-equipo-dialog.component.scss']
})
export class MovimientosEquipoDialogComponent implements OnInit {

  displayedColumns: string[] = ['tipo','fromSede','toSede','fechaInicio','descripcion','acciones'];

  // ✅ Ahora correctamente tipado con EquipoMovimiento
  dataSource = new MatTableDataSource<EquipoMovimiento>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  tipos = ['alta','traspaso','prestamo','devolucion','mantenimiento','reparacion','baja','ajuste'];

  tipoFiltro = new FormControl('');
  fechaInicioFiltro = new FormControl(null);
  fechaFinFiltro = new FormControl(null);

  loading = false;
  equipoId: string;

  constructor(
    private dialogRef: MatDialogRef<MovimientosEquipoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private movimientoService: EquipoMovimientoService
  ) {
    this.equipoId = data?.equipoId;
  }

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos() {
    this.loading = true;

    // ❗ Se eliminan filtros porque el servicio NO los soporta todavía
    this.movimientoService.listarPorEquipo(this.equipoId).subscribe({
      next: (lista) => {
        this.dataSource = new MatTableDataSource(lista || []);

        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando movimientos', err);
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    // Cuando el backend acepte filtros solo se reactiva esta línea
    this.cargarMovimientos();
  }

  cerrar() {
    this.dialogRef.close();
  }

  verDetalle(mov: EquipoMovimiento) {
    console.log('Detalle movimiento', mov);
    // Aquí podría ir un dialog con información detallada
  }
}
