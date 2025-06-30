import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

// Módulo de autenticación y layout general
import { AuthModule } from './auth/auth.module';
import { LayoutComponent } from './layout/layout.component';

// Dashboards por rol (vistas protegidas dentro del layout)
import { AdminDashboardComponent } from './roles/admin/admin-dashboard/admin-dashboard.component';
import { BarberoDashboardComponent } from './roles/barbero/barbero-dashboard/barbero-dashboard.component';
import { ClienteDashboardComponent } from './roles/cliente/cliente-dashboard/cliente-dashboard.component';

// Guardias
import { AuthGuard } from './guards/auth.guard';

// Ruteo modularizado
import { AppRoutingModule } from './app-routing.module';

// Angular Material y FlexLayout
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    AdminDashboardComponent,
    BarberoDashboardComponent,
    ClienteDashboardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AuthModule,
    AppRoutingModule, // ✅ Importa aquí las rutas
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    FlexLayoutModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}
