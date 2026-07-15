import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Categoria, CategoriasService } from 'src/app/core/services/categorias.service';
import { CategoriaDialogComponent } from './categoria-dialog/categoria-dialog.component';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent implements OnInit {

  categorias: Categoria[] = [];
  cargando: boolean = false;
  displayedColumns: string[] = ['nombre', 'descripcion', 'estado', 'acciones'];

  constructor(
    private categoriasService: CategoriasService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.cargando = true;
    this.categoriasService.obtenerCategorias().subscribe({
      next: (res: any) => {
        this.categorias = res.categorias || res || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('Error al cargar categorías', 'Cerrar', { duration: 3000 });
      }
    });
  }

  abrirDialogo(categoria?: Categoria) {
    const dialogRef = this.dialog.open(CategoriaDialogComponent, {
      width: '400px',
      data: { categoria }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCategorias();
      }
    });
  }

  eliminarCategoria(id: string) {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      this.categoriasService.eliminarCategoria(id).subscribe({
        next: () => {
          this.snackBar.open('Categoría eliminada', 'Cerrar', { duration: 3000 });
          this.cargarCategorias();
        },
        error: () => {
          this.snackBar.open('Error al eliminar categoría', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  cambiarEstado(categoria: Categoria) {
    const payload = { ...categoria, estado: !categoria.estado };
    this.categoriasService.actualizarCategoria(categoria._id!, payload).subscribe({
      next: () => {
        categoria.estado = payload.estado;
        this.snackBar.open('Estado actualizado', 'Cerrar', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
