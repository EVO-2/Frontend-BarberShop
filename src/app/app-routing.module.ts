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

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas públicas
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  // Rutas protegidas con layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // primero valida si hay token
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
        path: 'reservar', 
        component: ReservarCitaComponent, 
        canActivate: [RoleGuard], 
        data: { roles: ['cliente', 'admin'] } 
      },
      { 
        path: 'mis-citas', 
        component: MisCitasComponent, 
        canActivate: [RoleGuard], 
        data: { roles: ['cliente', 'barbero', 'admin'] } 
      },
      { 
        path: 'gestionar-citas', 
        component: GestionarCitasComponent, 
        canActivate: [RoleGuard], 
        data: { roles: ['barbero', 'admin'] } 
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
