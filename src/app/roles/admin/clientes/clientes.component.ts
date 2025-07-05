import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ClientesService } from 'src/app/services/clientes.service';
import { FormularioClienteComponent } from './formulario-cliente/formulario-cliente.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  columnas: string[] = ['id', 'nombre', 'correo', 'telefono', 'edad', 'estado', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private clienteService: ClientesService
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  aplicarFiltro(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(cliente?: any): void {
    const dialogRef = this.dialog.open(FormularioClienteComponent, {
      width: '400px',
      data: cliente || null
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        if (cliente && cliente.id) {
          this.clienteService.actualizarCliente(cliente.id, resultado).subscribe({
            next: () => {
              this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', { duration: 3000 });
              this.cargarClientes();
            },
            error: (err) => {
              console.error('Error al actualizar cliente:', err);
              this.snackBar.open('Error al actualizar cliente', 'Cerrar', { duration: 3000 });
            }
          });
        } else {
          this.clienteService.crearCliente(resultado).subscribe({
            next: () => {
              this.snackBar.open('Cliente creado exitosamente', 'Cerrar', { duration: 3000 });
              this.cargarClientes();
            },
            error: (err) => {
              console.error('Error al crear cliente:', err);
              this.snackBar.open('Error al crear cliente', 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  cambiarEstadoCliente(cliente: any): void {
  const accion = cliente.estado ? 'desactivarCliente' : 'activarCliente';

  this.clienteService[accion](cliente.id).subscribe({
    next: () => {
      this.snackBar.open(`Cliente ${cliente.estado ? 'desactivado' : 'activado'} correctamente`, 'Cerrar', {
        duration: 3000
      });
      this.cargarClientes();
    },
    error: (err) => {
      console.error('Error al cambiar estado del cliente:', err);
      this.snackBar.open('Error al cambiar estado del cliente', 'Cerrar', {
        duration: 3000
      });
    }
  });
}

}
