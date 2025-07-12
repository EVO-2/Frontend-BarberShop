import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { ReservarCitaComponent } from './pages/reservar-cita/reservar-cita.component';
import { MisCitasComponent } from './pages/mis-citas/mis-citas.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { LayoutComponent } from './layout/layout/layout.component';
// import { AuthGuard } from './auth/auth.guard'; // descomenta si tienes AuthGuard

const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    // canActivate: [AuthGuard], // opcional: proteger todo Layout
    children: [
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'reservar', component: ReservarCitaComponent }, // cliente
      { path: 'mis-citas', component: MisCitasComponent },     // cliente y barbero
      { path: 'perfil', component: PerfilComponent },          // perfil de usuario
    ]
  },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
