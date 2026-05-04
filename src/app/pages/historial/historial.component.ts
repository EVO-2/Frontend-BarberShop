import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { HistorialService } from '../../services/historial.service';
import { HistorialAcceso } from '../../interfaces/historial.interface';
import { ToastrService } from 'ngx-toastr';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HistorialComponent implements OnInit {
  displayedColumns: string[] = ['fecha', 'usuario', 'modulo', 'accion', 'descripcion'];
  historial: HistorialAcceso[] = [];
  totalRegistros: number = 0;
  pageSize: number = 50;
  pageIndex: number = 0;
  isLoading: boolean = true;
  expandedElement: HistorialAcceso | null = null;

  filtros = {
    modulo: '',
    accion: '',
    fechaInicio: '',
    fechaFin: ''
  };

  modulos = ['AUTENTICACION', 'CITAS', 'USUARIOS', 'INVENTARIO', 'PRODUCTOS', 'SERVICIOS', 'REPORTES', 'SEDES', 'PAGOS', 'CONFIGURACION'];
  acciones = ['LOGIN', 'LOGOUT', 'CREAR', 'ACTUALIZAR', 'ELIMINAR', 'INTENTO_FALLIDO', 'LECTURA'];

  constructor(
    private historialService: HistorialService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.isLoading = true;
    const saltar = this.pageIndex * this.pageSize;

    this.historialService.obtenerHistorial(this.pageSize, saltar, this.filtros).subscribe({
      next: (res) => {
        if (res.ok) {
          this.historial = res.historial;
          this.totalRegistros = res.total;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Error al cargar el historial de auditoría', 'Error');
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.pageIndex = 0; // reset a la primera página
    this.cargarHistorial();
  }

  limpiarFiltros(): void {
    this.filtros = {
      modulo: '',
      accion: '',
      fechaInicio: '',
      fechaFin: ''
    };
    this.aplicarFiltros();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarHistorial();
  }

  getBadgeColor(accion: string): string {
    switch (accion) {
      case 'LOGIN': return 'badge-login';
      case 'CREAR': return 'badge-crear';
      case 'ACTUALIZAR': return 'badge-actualizar';
      case 'ELIMINAR': return 'badge-eliminar';
      case 'INTENTO_FALLIDO': return 'badge-fallido';
      default: return 'badge-default';
    }
  }

  getNombreUsuario(h: HistorialAcceso): string {
    return h.usuario?.nombre || 'Sistema';
  }
}
