import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Proveedor, ProveedoresService } from 'src/app/core/services/proveedores.service';
import { ProveedorDialogComponent } from './proveedor-dialog/proveedor-dialog.component';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss']
})
export class ProveedoresComponent implements OnInit {

  proveedores: Proveedor[] = [];
  cargando: boolean = false;
  displayedColumns: string[] = ['nombre', 'contacto', 'telefono', 'estado', 'acciones'];

  constructor(
    private proveedoresService: ProveedoresService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.cargando = true;
    this.proveedoresService.obtenerProveedores().subscribe({
      next: (res: any) => {
        this.proveedores = res.proveedores || res || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('Error al cargar proveedores', 'Cerrar', { duration: 3000 });
      }
    });
  }

  abrirDialogo(proveedor?: Proveedor) {
    const dialogRef = this.dialog.open(ProveedorDialogComponent, {
      width: '450px',
      data: { proveedor }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarProveedores();
      }
    });
  }

  eliminarProveedor(id: string) {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      this.proveedoresService.eliminarProveedor(id).subscribe({
        next: () => {
          this.snackBar.open('Proveedor eliminado', 'Cerrar', { duration: 3000 });
          this.cargarProveedores();
        },
        error: () => {
          this.snackBar.open('Error al eliminar proveedor', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  cambiarEstado(proveedor: Proveedor) {
    const payload = { ...proveedor, estado: !proveedor.estado };
    this.proveedoresService.actualizarProveedor(proveedor._id!, payload).subscribe({
      next: () => {
        proveedor.estado = payload.estado;
        this.snackBar.open('Estado actualizado', 'Cerrar', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
