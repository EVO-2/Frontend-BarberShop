import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes de autenticación
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';

// Layout general (menú, toolbar, footer)
import { LayoutComponent } from './layout/layout.component';

// Guardias de acceso
import { AuthGuard } from './guards/auth.guard';

// Dashboards según rol (rutas corregidas)
import { AdminDashboardComponent } from './roles/admin/admin-dashboard/admin-dashboard.component';
import { BarberoDashboardComponent } from './roles/barbero/barbero-dashboard/barbero-dashboard.component';
import { ClienteDashboardComponent } from './roles/cliente/cliente-dashboard/cliente-dashboard.component';

const routes: Routes = [
  // Login y Registro sin layout
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Rutas protegidas que usan el LayoutComponent
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'barbero',
        component: BarberoDashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: ['barbero'] }
      },
      {
        path: 'cliente',
        component: ClienteDashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: ['cliente'] }
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Ruta por defecto para cualquier otra
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
