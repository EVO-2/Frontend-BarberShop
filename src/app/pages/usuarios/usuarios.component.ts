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
        this.dataSource.data = usuarios;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err: any) => {
        console.error(err);
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
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '400px',
      data: usuario || null,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.snackBar.open(
          usuario ? 'Usuario actualizado' : 'Usuario creado',
          'Cerrar',
          { duration: 3000 }
        );
        this.cargarUsuarios();
      }
    });
  }

  cambiarEstado(usuario: any): void {
    usuario.estado = !usuario.estado;

    this.usuarioService.cambiarEstadoUsuario(usuario._id, usuario.estado).subscribe({
      next: () => {
        this.snackBar.open(
          `Usuario ${usuario.estado ? 'activado' : 'desactivado'}`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: () => {
        usuario.estado = !usuario.estado; // Revertir si falla
        this.snackBar.open('Error al cambiar estado', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
}
