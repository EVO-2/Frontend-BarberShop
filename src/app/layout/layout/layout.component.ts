import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/interfaces/usuario.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  avatarUrl: string = 'assets/img/default-avatar.png';
  horaActual: string = '';
  fechaActual: string = '';
  perfilForm!: FormGroup;
  fotoPerfilUrl$!: Observable<string>;

  private usuarioSub!: Subscription;
  private avatarSub!: Subscription;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscripciones reactivas
    this.usuarioSub = this.authService.usuario$.subscribe((user) => {
      this.usuario = user;
      this.actualizarFormulario();
    });

    this.avatarSub = this.authService.avatarUrl$.subscribe((url) => {
      this.avatarUrl = url || 'assets/img/default-avatar.png';
    });

    // Cargar datos iniciales
    this.authService.refrescarUsuario();
    this.actualizarFechaHora();
    setInterval(() => this.actualizarFechaHora(), 1000);
  }

  actualizarFormulario(): void {
    this.perfilForm = this.fb.group({
      nombre: [this.usuario?.nombre || '', Validators.required],
      correo: [this.usuario?.correo || '', [Validators.required, Validators.email]],
      direccion: [this.usuario?.cliente?.direccion || '', [Validators.maxLength(100)]],
      telefono: [this.usuario?.cliente?.telefono || '', [Validators.pattern(/^\d{7,15}$/)]]
    });
  }

  actualizarPerfil(): void {
    if (this.perfilForm.invalid || !this.usuario) return;

    const formData = new FormData();
    formData.append('nombre', this.perfilForm.get('nombre')?.value);
    formData.append('correo', this.perfilForm.get('correo')?.value);
    formData.append('direccion', this.perfilForm.get('direccion')?.value || '');
    formData.append('telefono', this.perfilForm.get('telefono')?.value || '');

    this.authService.actualizarPerfil(formData).subscribe({
      next: () => {
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 2500 });
        this.authService.refrescarUsuario();
      },
      error: () => {
        this.snackBar.open('Error al actualizar perfil', 'Cerrar', { duration: 2500 });
      }
    });
  }

  cancelarCambios(): void {
    this.actualizarFormulario();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Selecciona un archivo de imagen válido', 'Cerrar', { duration: 2500 });
        return;
      }

      const formData = new FormData();
      formData.append('foto', file);

      this.authService.actualizarPerfil(formData).subscribe({
        next: () => {
          this.snackBar.open('Foto actualizada con éxito', 'Cerrar', { duration: 2500 });
          this.authService.refrescarUsuario();
        },
        error: () => {
          this.snackBar.open('Error al subir la foto', 'Cerrar', { duration: 2500 });
        }
      });
    }
  }

  irAEditarPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  cerrarSesion(): void {
    this.authService.logout();
  }

  actualizarFechaHora(): void {
    const fecha = new Date();
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Bogota'
    };
    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Bogota'
    };

    this.fechaActual = new Intl.DateTimeFormat('es-CO', opcionesFecha).format(fecha);
    this.horaActual = new Intl.DateTimeFormat('es-CO', opcionesHora).format(fecha);
  }

  ngOnDestroy(): void {
    this.usuarioSub?.unsubscribe();
    this.avatarSub?.unsubscribe();
  }
}