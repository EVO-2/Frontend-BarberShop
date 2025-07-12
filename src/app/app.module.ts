import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Componentes
import { MatListModule } from '@angular/material/list';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';


// Angular Material Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioFormDialogComponent } from './shared/components/usuario-form-dialog/usuario-form-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { LayoutComponent } from './layout/layout/layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';





@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UsuariosComponent,
    UsuarioFormDialogComponent,
    LayoutComponent,
    SidebarComponent
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatListModule,
    BrowserAnimationsModule,

    // Material
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule
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
