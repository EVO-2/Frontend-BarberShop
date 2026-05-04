import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RolesService } from '../../core/services/roles.service';
import { Rol } from '../../shared/models/roles.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

// Dialog
import { RolDialogComponent } from './rol-dialog/rol-dialog.component';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Rol>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  roles: Rol[] = [];
  form: FormGroup;
  textoBusqueda: string = '';

  constructor(
    private rolesService: RolesService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      permisos: [[]]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  ngAfterViewInit(): void {
    // Se asigna aquí para evitar problemas de visualización en móviles
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // =============================
  // Cargar Roles
  // =============================
  cargarRoles() {
    this.rolesService.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res?.roles || [];
        this.dataSource = new MatTableDataSource<Rol>(this.roles);

        // Paginator y sort
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });

        // Filtro que funcione en móviles y desktop
        this.dataSource.filterPredicate = (data: Rol, filter: string) => {
          const dataStr = (data.nombre + ' ' + (data.descripcion || '')).toLowerCase();
          return dataStr.indexOf(filter) !== -1;
        };
      },
      error: (err) => {
        console.error(err);
        this.roles = [];
        this.dataSource = new MatTableDataSource<Rol>([]);
      }
    });
  }

  // =============================
  // Filtro
  // =============================
  aplicarFiltro(event: any) {
    const rawValue = (event.target as HTMLInputElement).value;
    this.textoBusqueda = rawValue;
    const valorBusqueda = rawValue.trim().toLowerCase();
    this.dataSource.filter = valorBusqueda;
  }

  limpiarFiltro() {
    this.textoBusqueda = '';
    this.dataSource.filter = '';
  }

  // =============================
  // Cambiar estado
  // =============================
  cambiarEstado(rol: Rol, event: any) {
    const nuevoEstado = event.checked;
    rol.estado = nuevoEstado;
    this.dataSource.data = [...this.dataSource.data];

    this.rolesService.actualizarRol(rol._id!, { estado: nuevoEstado } as Rol).subscribe({
      error: () => {
        rol.estado = !nuevoEstado;
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }

  // =============================
  // Eliminar
  // =============================
  eliminar(id: string) {
    if (!confirm('¿Eliminar rol?')) return;

    this.rolesService.eliminarRol(id).subscribe(() => {
      this.cargarRoles();
    });
  }

  // =============================
  // Crear / Editar dialog
  // =============================
  abrirDialog(rol?: Rol) {
    const dialogRef = this.dialog.open(RolDialogComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: rol || null
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;

      const payload = {
        nombre: result.nombre?.trim(),
        descripcion: result.descripcion || '',
        permisos: result.permisos || [],
        estado: result.estado ?? true
      };

      if (rol) {
        this.rolesService.actualizarRol(rol._id!, payload)
          .subscribe(() => this.cargarRoles());
      } else {
        this.rolesService.crearRol(payload)
          .subscribe(() => this.cargarRoles());
      }
    });
  }
}