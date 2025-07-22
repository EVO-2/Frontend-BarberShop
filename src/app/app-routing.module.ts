import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout/layout.component';
// import { AuthGuard } from './guards/auth.guard'; // <-- puedes activarlo luego
import { RegistroComponent } from './auth/registro/registro.component';


const routes: Routes = [
  // ✅ Redirección por defecto a login si accede a raíz
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ✅ Ruta pública de login
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  // ✅ Rutas protegidas bajo layout
  {
    path: '',
    component: LayoutComponent,
    // canActivate: [AuthGuard], // <-- activar si tienes guardas de autenticación
    children: [
      { path: 'dashboard', component: DashboardComponent },
      // Aquí puedes agregar más rutas protegidas
    ]
  },

  // ✅ Redirección de rutas no válidas
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
