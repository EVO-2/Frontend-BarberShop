import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UsuarioService } from '../../core/services/usuario.service';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioFormDialogComponent } from '../../shared/components/usuario-form-dialog/usuario-form-dialog.component';



@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nombre', 'correo', 'rol', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private usuarioService: UsuarioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios: any[]) => {
        this.dataSource.data = usuarios;
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editarUsuario(usuario: any): void {
  const dialogRef = this.dialog.open(UsuarioFormDialogComponent, {
    width: '400px',
    data: { usuario } // Pasamos el usuario a editar
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.usuarioService.actualizarUsuario(usuario._id, result).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
        }
      });
    }
  });
}

  eliminarUsuario(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.usuarioService.eliminarUsuario(id).subscribe({
        next: () => {
          this.cargarUsuarios(); // recargar la lista
        },
        error: (err: any) => {
          console.error('Error al eliminar usuario:', err);
        }
      });
    }
  }

  cambiarEstado(usuario: any): void {
  const nuevoEstado = !usuario.estado;

  this.usuarioService.actualizarEstado(usuario._id, nuevoEstado).subscribe({
    next: () => {
      usuario.estado = nuevoEstado;
      this.snackBar.open(
        `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
        'Cerrar',
        { duration: 3000, panelClass: ['snackbar-success'] }
      );
    },
    error: (err) => {
      console.error('Error al cambiar el estado:', err);
      this.snackBar.open('Error al actualizar el estado', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  });
}

abrirFormulario(): void {
  const dialogRef = this.dialog.open(UsuarioFormDialogComponent, {
    width: '400px'
  });

  dialogRef.afterClosed().subscribe(resultado => {
    if (resultado) {
      this.usuarioService.crearUsuario(resultado).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: err => {
          console.error('Error al crear usuario:', err);
          this.snackBar.open('Error al crear usuario', 'Cerrar', { duration: 3000 });
        }
      });
    }
  });
}
}
