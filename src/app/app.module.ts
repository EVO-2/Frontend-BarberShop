import { NgModule } from '@angular/core';  
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor'; 

import { MaterialModule } from './shared/material.module';

// ======= Componentes =======
import { LoginComponent } from './auth/login/login.component';
import { RegistroComponent } from './auth/registro/registro.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { UsuarioDialogComponent } from './pages/usuarios/usuario-dialog/usuario-dialog.component';
import { ReservarCitaComponent } from './pages/reserva/reservar-cita/reservar-cita.component'; 
import { MisCitasComponent } from './pages/citas/mis-citas/mis-citas.component'; 
import { CitaUpdateDialogComponent } from './pages/citas/cita-update-dialog/cita-update-dialog.component'; 
import { PagoDialogComponent } from './pages/citas/pago-dialog/pago-dialog.component'; 
import { GestionarCitasComponent } from './pages/gestionar-citas/gestionar-citas.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ServicioCardDialogComponent } from './shared/components/servicio-card-dialog/servicio-card-dialog.component';
import { LayoutModule } from './layout/layout.module';

import { SedesComponent } from './pages/sedes/sedes.component';
import { SedeDialogComponent } from './shared/components/sede-dialog/sede-dialog.component'; 
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistroComponent,
    UsuariosComponent,
    UsuarioDialogComponent,
    ReservarCitaComponent,
    MisCitasComponent,
    CitaUpdateDialogComponent, 
    PagoDialogComponent, 
    GestionarCitasComponent,
    ConfirmDialogComponent,
    ServicioCardDialogComponent,
    SedesComponent,
    SedeDialogComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,  
    LayoutModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
