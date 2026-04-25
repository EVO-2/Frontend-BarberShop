import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { RegistroComponent } from './auth/registro/registro.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { ReservarCitaComponent } from './pages/reserva/reservar-cita/reservar-cita.component';
import { MisCitasComponent } from './pages/citas/mis-citas/mis-citas.component';
import { GestionarCitasComponent } from './pages/gestionar-citas/gestionar-citas.component';
import { RoleGuard } from './guards/role.guard';
import { SedesComponent } from './pages/sedes/sedes.component';
import { GestionarPuestosComponent } from './pages/gestionar-puestos/gestionar-puestos.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { ReporteIngresosComponent } from './pages/reportes/reporte-ingresos/reporte-ingresos.component';

// ✅ IMPORTAMOS COMPONENTES
import { ListadoEquiposComponent } from './pages/equipos/listado-equipos/listado-equipos.component';
import { ServiciosClienteComponent } from './pages/servicios-cliente/servicios-cliente.component';

// 🔐 Roles
import { RolesComponent } from './pages/roles/roles.component';

// 🆕 Productos
import { ProductosComponent } from './pages/productos/productos/productos.component';
import { ProductosClienteComponent } from './pages/productos-cliente/productos-cliente.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas públicas
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  // Rutas protegidas con layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'perfil', component: PerfilComponent },

      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'sedes',
        component: SedesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'puestos',
        component: GestionarPuestosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },

      {
        path: 'servicios-admin',
        component: ServiciosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },

      {
        path: 'servicios',
        component: ServiciosClienteComponent,
        canActivate: [RoleGuard],
        data: { roles: ['cliente', 'admin'] }
      },

      {
        path: 'equipos',
        component: ListadoEquiposComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },

      {
        path: 'productos',
        component: ProductosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },

      {
        path: 'tienda',
        component: ProductosClienteComponent,
        canActivate: [RoleGuard],
        data: { roles: ['cliente', 'admin'] }
      },

      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },

      {
        path: 'reservar',
        component: ReservarCitaComponent,
        canActivate: [RoleGuard],
        data: { roles: ['cliente', 'admin'] }
      },
      {
        path: 'mis-citas',
        component: MisCitasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['cliente', 'barbero', 'manicurista', 'admin'] }
      },
      {
        path: 'gestionar-citas',
        component: GestionarCitasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['barbero', 'manicurista', 'admin'] }
      },
      {
        path: 'reportes/ingresos',
        component: ReporteIngresosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      }
    ]
  },

  // Ruta comodín
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }