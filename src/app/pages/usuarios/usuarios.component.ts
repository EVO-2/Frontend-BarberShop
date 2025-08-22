import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { UsuarioService } from 'src/app/core/services/usuario.service';
import { UsuarioDialogComponent } from './usuario-dialog/usuario-dialog.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'nombre', 'correo', 'rol', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios: any[]) => {
        const usuariosExtendidos = usuarios.map((usuario) => {
          const rolNombre = usuario.rol?.nombre || '';

          const esCliente = rolNombre === 'cliente';
          const esBarbero = rolNombre === 'barbero';

          return {
            ...usuario,
            telefono: esCliente ? usuario.detalles?.telefono : usuario.detalles?.telefono_profesional,
            direccion: esCliente ? usuario.detalles?.direccion : usuario.detalles?.direccion_profesional,
            genero: usuario.detalles?.genero || '',
            especialidades: esBarbero ? usuario.detalles?.especialidades?.join(', ') : '',
            sede: esBarbero ? usuario.detalles?.sede?.nombre : '',
            puestoTrabajo: esBarbero ? usuario.detalles?.puestoTrabajo?.nombre : '',
          };
        });

        
        this.dataSource.data = usuariosExtendidos;
      },
      error: (err) => {
        console.error('❌ Error al cargar usuarios:', err);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
      },
    });
  }

  aplicarFiltro(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filtro;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  abrirDialog(usuario?: any): void {
    const data = usuario && usuario._id
  ? { modo: 'editar', usuarioId: usuario._id, correoActual: usuario.correo }
  : { modo: 'crear' };

    this.dialog.open(UsuarioDialogComponent, {
      width: '500px',
      data,
      disableClose: true
    }).afterClosed().subscribe((resultado) => {
      if (resultado) {
        const mensaje = data.modo === 'crear'
          ? 'Usuario creado correctamente'
          : 'Usuario actualizado correctamente';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.cargarUsuarios();
      }
    });
  }

  cambiarEstado(usuario: any): void {
    const nuevoEstado = !usuario.estado;

    this.usuarioService.cambiarEstadoUsuario(usuario._id, nuevoEstado).subscribe({
      next: () => {
        usuario.estado = nuevoEstado;
        this.snackBar.open(
          `Usuario ${nuevoEstado ? 'activado' : 'desactivado'}`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Error al cambiar estado del usuario', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
}
