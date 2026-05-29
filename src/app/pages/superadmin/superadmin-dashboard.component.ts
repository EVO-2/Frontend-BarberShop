import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperadminService } from 'src/app/core/services/superadmin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrls: ['./superadmin-dashboard.component.scss']
})
export class SuperadminDashboardComponent implements OnInit {
  stats: any = null;
  historial: any[] = [];
  empresas: any[] = [];
  loading = true;
  loadingEmpresas = true;

  // Filtros
  filtroNombre = '';
  filtroPlan = '';
  filtroEstado = '';

  // Modal de edición de suscripción
  mostrarModalSuscripcion = false;
  empresaSeleccionada: any = null;
  datosSuscripcion = {
    plan: '',
    suscripcionEstado: '',
    fechaFinPrueba: '',
    fechaProximoCobro: ''
  };

  constructor(
    private superadminService: SuperadminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarStats();
    this.cargarEmpresas();
  }

  cargarStats(): void {
    this.loading = true;
    this.superadminService.obtenerStats().subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.historial = res.historial || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando stats:', err);
        this.toastr.error('No se pudieron cargar las estadísticas globales.');
        this.loading = false;
      }
    });
  }

  cargarEmpresas(): void {
    this.loadingEmpresas = true;
    this.superadminService.obtenerEmpresas().subscribe({
      next: (res) => {
        this.empresas = res.empresas || [];
        this.loadingEmpresas = false;
      },
      error: (err) => {
        console.error('Error cargando empresas:', err);
        this.toastr.error('No se pudo obtener el listado de empresas.');
        this.loadingEmpresas = false;
      }
    });
  }

  get empresasFiltradas(): any[] {
    return this.empresas.filter(emp => {
      const cumpleNombre = !this.filtroNombre || 
        emp.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase()) ||
        (emp.dueno && emp.dueno.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())) ||
        (emp.dueno && emp.dueno.correo.toLowerCase().includes(this.filtroNombre.toLowerCase()));
      
      const cumplePlan = !this.filtroPlan || emp.plan === this.filtroPlan;
      const cumpleEstado = !this.filtroEstado || emp.suscripcionEstado === this.filtroEstado;

      return cumpleNombre && cumplePlan && cumpleEstado;
    });
  }

  toggleEstadoEmpresa(empresa: any, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const nuevoEstado = inputElement.checked;
    
    this.superadminService.toggleEstadoEmpresa(empresa._id, nuevoEstado).subscribe({
      next: (res) => {
        empresa.estado = nuevoEstado;
        this.toastr.success(`Empresa ${nuevoEstado ? 'habilitada' : 'deshabilitada'} correctamente.`);
        this.cargarStats(); // Recargar stats por si cambia algo
      },
      error: (err) => {
        console.error('Error al cambiar estado de empresa:', err);
        this.toastr.error('Error al cambiar el estado de la empresa.');
        // Revertir checkbox
        inputElement.checked = !nuevoEstado;
      }
    });
  }

  abrirModalSuscripcion(empresa: any): void {
    this.empresaSeleccionada = empresa;
    this.datosSuscripcion = {
      plan: empresa.plan || 'trial',
      suscripcionEstado: empresa.suscripcionEstado || 'trial',
      fechaFinPrueba: empresa.fechaFinPrueba ? new Date(empresa.fechaFinPrueba).toISOString().substring(0, 10) : '',
      fechaProximoCobro: empresa.fechaProximoCobro ? new Date(empresa.fechaProximoCobro).toISOString().substring(0, 10) : ''
    };
    this.mostrarModalSuscripcion = true;
  }

  cerrarModalSuscripcion(): void {
    this.mostrarModalSuscripcion = false;
    this.empresaSeleccionada = null;
  }

  guardarSuscripcion(): void {
    if (!this.empresaSeleccionada) return;

    const payload = {
      plan: this.datosSuscripcion.plan,
      suscripcionEstado: this.datosSuscripcion.suscripcionEstado,
      fechaFinPrueba: this.datosSuscripcion.fechaFinPrueba ? new Date(this.datosSuscripcion.fechaFinPrueba).toISOString() : null,
      fechaProximoCobro: this.datosSuscripcion.fechaProximoCobro ? new Date(this.datosSuscripcion.fechaProximoCobro).toISOString() : null
    };

    this.superadminService.actualizarSuscripcion(this.empresaSeleccionada._id, payload).subscribe({
      next: (res) => {
        this.toastr.success('Suscripción actualizada exitosamente.');
        this.cargarEmpresas();
        this.cargarStats();
        this.cerrarModalSuscripcion();
      },
      error: (err) => {
        console.error('Error actualizando suscripción:', err);
        this.toastr.error('No se pudo actualizar la suscripción de la empresa.');
      }
    });
  }

  getDesgloseCantidad(lista: any[], key: string): number {
    if (!lista) return 0;
    const item = lista.find(i => i._id === key);
    return item ? item.cantidad : 0;
  }
}
