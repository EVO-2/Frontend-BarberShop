import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes de autenticación
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';

// Layout general
import { LayoutComponent } from './layout/layout.component';

// Guardias
import { AuthGuard } from './guards/auth.guard';

// Dashboards
import { AdminDashboardComponent } from './roles/admin/admin-dashboard/admin-dashboard.component';
import { BarberoDashboardComponent } from './roles/barbero/barbero-dashboard/barbero-dashboard.component';

// Admin Components
import { UsuariosComponent } from './roles/admin/usuarios/usuarios.component';
import { ClientesComponent } from './roles/admin/clientes/clientes.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Rutas ADMIN
      {
        path: 'admin',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        children: [
          { path: 'dashboard', component: AdminDashboardComponent },
          { path: 'usuarios', component: UsuariosComponent },
          { path: 'clientes', component: ClientesComponent } // ✅ ahora está dentro
        ]
      },

      // Ruta BARBERO
      {
        path: 'barbero',
        component: BarberoDashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: ['barbero'] }
      },

      // Redirección por defecto
      { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' }
    ]
  },

  // Ruta catch-all
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
