import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { FormularioUsuarioComponent } from './formulario-usuario/formulario-usuario.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  columnas: string[] = ['id', 'nombre', 'correo', 'rol', 'estado', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  aplicarFiltro(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(usuario?: any): void {
  const dialogRef = this.dialog.open(FormularioUsuarioComponent, {
    width: '400px',
    data: usuario || null
  });

  dialogRef.afterClosed().subscribe((resultado) => {
    if (resultado) {
      if (usuario && usuario.id) {
        // 🔁 Actualización
        this.usuariosService.actualizarUsuario(usuario.id, resultado).subscribe({
          next: () => {
            this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.cargarUsuarios();
          },
          error: (err) => {
            console.error('Error al actualizar usuario:', err);
            this.snackBar.open('Error al actualizar usuario', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        // ➕ Creación
        this.usuariosService.crearUsuario(resultado).subscribe({
          next: () => {
            this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
            this.cargarUsuarios();
          },
          error: (err) => {
            console.error('Error al crear usuario:', err);
            this.snackBar.open('Error al crear usuario', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  });
}

  cambiarEstadoUsuario(usuario: any): void {
    const accion = usuario.estado ? 'desactivarUsuario' : 'activarUsuario';
    this.usuariosService[accion](usuario.id).subscribe({
      next: () => {
        this.snackBar.open(`Usuario ${usuario.estado ? 'desactivado' : 'activado'} correctamente`, 'Cerrar', {
          duration: 3000
        });
        this.cargarUsuarios();
      },
      error: (err) => {
        this.snackBar.open(`Error al cambiar estado del usuario`, 'Cerrar', { duration: 3000 });
        console.error(err);
      }
    });
  }
}
