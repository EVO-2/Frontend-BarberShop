import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RolesService } from '../../core/services/roles.service';
import { Rol } from '../../shared/models/roles.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// 🔥 Angular Material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

// ✅ Dialog
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
  editando: boolean = false;
  rolId: string | null = null;

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
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // =============================
  // 📦 Cargar Roles
  // =============================
  cargarRoles() {
    this.rolesService.getRoles().subscribe({
      next: (data: Rol[]) => {

        console.log('ROLES BACKEND:', data);

        this.roles = data;
        this.dataSource = new MatTableDataSource<Rol>(data);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error(err)
    });
  }

  // =============================
  // 🔍 Filtro
  // =============================
  aplicarFiltro(event: any) {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  // ===================
  // 🔄 Cambiar estado
  // ===================
  cambiarEstado(rol: Rol, event: any) {
    const nuevoEstado = event.checked;

    rol.estado = nuevoEstado;
    this.dataSource.data = [...this.dataSource.data];

    this.rolesService.actualizarRol(rol._id!, {
      estado: nuevoEstado
    } as Rol).subscribe({
      error: () => {
        rol.estado = !nuevoEstado;
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }

  // =============================
  // 🗑️ Eliminar
  // =============================
  eliminar(id: string) {
    if (!confirm('¿Eliminar rol?')) return;

    this.rolesService.eliminarRol(id).subscribe(() => {
      this.cargarRoles();
    });
  }

  // =============================
  // 💎 DIALOG PRO (crear / editar)
  // =============================
  abrirDialog(rol?: Rol) {

    console.log('ABRIENDO DIALOG');

    const dialogRef = this.dialog.open(RolDialogComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: rol || null
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;

      if (rol) {
        this.rolesService.actualizarRol(rol._id!, result).subscribe(() => {
          this.cargarRoles();
        });
      } else {
        this.rolesService.crearRol(result).subscribe(() => {
          this.cargarRoles();
        });
      }
    });
  }
}