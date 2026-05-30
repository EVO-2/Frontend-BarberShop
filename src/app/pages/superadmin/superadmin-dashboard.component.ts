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

  // Filtros de empresas
  filtroNombre = '';
  filtroPlan = '';
  filtroEstado = '';

  // Control de pestañas
  tabActiva: 'dashboard' | 'admins' = 'dashboard';

  // SuperAdministradores
  admins: any[] = [];
  loadingAdmins = false;
  filtroAdmin = '';

  // Modal de edición de suscripción de empresas
  mostrarModalSuscripcion = false;
  empresaSeleccionada: any = null;
  datosSuscripcion = {
    plan: '',
    suscripcionEstado: '',
    fechaFinPrueba: '',
    fechaProximoCobro: ''
  };

  // Modal para CRUD de SuperAdmins
  mostrarModalAdmin = false;
  modoEdicionAdmin = false;
  adminSeleccionado: any = null;
  datosAdmin = {
    nombre: '',
    correo: '',
    password: ''
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

  // ==========================================
  // 🛠️ CRUD SUPERADMINS LÓGICA
  // ==========================================

  cargarSuperAdmins(): void {
    this.loadingAdmins = true;
    this.superadminService.obtenerSuperAdmins().subscribe({
      next: (res) => {
        this.admins = res.admins || [];
        this.loadingAdmins = false;
      },
      error: (err) => {
        console.error('Error cargando superadmins:', err);
        this.toastr.error('No se pudo obtener el listado de administradores.');
        this.loadingAdmins = false;
      }
    });
  }

  get adminsFiltrados(): any[] {
    if (!this.filtroAdmin?.trim()) return this.admins;
    const query = this.filtroAdmin.toLowerCase().trim();
    return this.admins.filter(adm => 
      adm.nombre.toLowerCase().includes(query) || 
      adm.correo.toLowerCase().includes(query)
    );
  }

  abrirModalCrearAdmin(): void {
    this.modoEdicionAdmin = false;
    this.adminSeleccionado = null;
    this.datosAdmin = {
      nombre: '',
      correo: '',
      password: ''
    };
    this.mostrarModalAdmin = true;
  }

  abrirModalEditarAdmin(admin: any): void {
    this.modoEdicionAdmin = true;
    this.adminSeleccionado = admin;
    this.datosAdmin = {
      nombre: admin.nombre,
      correo: admin.correo,
      password: '' // vacía para no sobrescribir a menos que el usuario la cambie
    };
    this.mostrarModalAdmin = true;
  }

  cerrarModalAdmin(): void {
    this.mostrarModalAdmin = false;
    this.adminSeleccionado = null;
  }

  guardarAdmin(): void {
    if (!this.datosAdmin.nombre?.trim() || !this.datosAdmin.correo?.trim()) {
      this.toastr.warning('El nombre y el correo electrónico son campos requeridos.');
      return;
    }

    if (!this.modoEdicionAdmin && !this.datosAdmin.password) {
      this.toastr.warning('La contraseña es obligatoria al crear un administrador.');
      return;
    }

    this.loadingAdmins = true;

    if (this.modoEdicionAdmin && this.adminSeleccionado) {
      // Editar
      const payload: any = {
        nombre: this.datosAdmin.nombre,
        correo: this.datosAdmin.correo
      };
      if (this.datosAdmin.password?.trim()) {
        payload.password = this.datosAdmin.password;
      }

      this.superadminService.actualizarSuperAdmin(this.adminSeleccionado._id, payload).subscribe({
        next: (res) => {
          this.toastr.success('Superadministrador actualizado correctamente.');
          this.cargarSuperAdmins();
          this.cerrarModalAdmin();
        },
        error: (err) => {
          console.error('Error al actualizar admin:', err);
          this.toastr.error(err.error?.mensaje || 'No se pudo actualizar el administrador.');
          this.loadingAdmins = false;
        }
      });
    } else {
      // Crear
      this.superadminService.crearSuperAdmin(this.datosAdmin).subscribe({
        next: (res) => {
          this.toastr.success('Superadministrador registrado correctamente.');
          this.cargarSuperAdmins();
          this.cerrarModalAdmin();
        },
        error: (err) => {
          console.error('Error al crear admin:', err);
          this.toastr.error(err.error?.mensaje || 'No se pudo crear el administrador.');
          this.loadingAdmins = false;
        }
      });
    }
  }

  toggleEstadoAdmin(admin: any, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const nuevoEstado = inputElement.checked;

    this.superadminService.toggleSuperAdminEstado(admin._id, nuevoEstado).subscribe({
      next: (res) => {
        admin.estado = nuevoEstado;
        this.toastr.success(`Superadministrador ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`);
      },
      error: (err) => {
        console.error('Error al cambiar estado de admin:', err);
        this.toastr.error(err.error?.mensaje || 'Error al cambiar el estado del administrador.');
        // Revertir switch en la interfaz
        inputElement.checked = !nuevoEstado;
      }
    });
  }
}
