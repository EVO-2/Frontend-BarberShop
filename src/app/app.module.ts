import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

// Componentes raíz
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';

// Módulos
import { AuthModule } from './auth/auth.module';
import { AppRoutingModule } from './app-routing.module';

// Dashboards por rol
import { AdminDashboardComponent } from './roles/admin/admin-dashboard/admin-dashboard.component';
import { BarberoDashboardComponent } from './roles/barbero/barbero-dashboard/barbero-dashboard.component';
import { ClienteDashboardComponent } from './roles/cliente/cliente-dashboard/cliente-dashboard.component';

// Componentes de usuarios
import { UsuariosComponent } from './roles/admin/usuarios/usuarios.component';
import { FormularioUsuarioComponent } from './roles/admin/usuarios/formulario-usuario/formulario-usuario.component';

// Guardias e interceptores
import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './auth/auth.interceptor';

// Angular Material y FlexLayout
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';




@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    AdminDashboardComponent,
    BarberoDashboardComponent,
    ClienteDashboardComponent,
    UsuariosComponent,
    FormularioUsuarioComponent,
    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AuthModule,
    AppRoutingModule,

    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    FlexLayoutModule,
    MatTooltipModule,
    MatPaginatorModule

  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
