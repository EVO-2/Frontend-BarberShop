import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/interfaces/usuario.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

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

  private usuarioSub!: Subscription;
  private fotoPerfilSub!: Subscription;
  private relojInterval!: ReturnType<typeof setInterval>;

  constructor(
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscripción al usuario
    this.usuarioSub = this.authService.usuario$.subscribe((user) => {
      this.usuario = user;
    });

    // Suscripción a cambios en la foto de perfil
    this.fotoPerfilSub = this.authService.fotoPerfil$.subscribe((url: string) => {
      this.avatarUrl = url || 'assets/img/default-avatar.png';
    });

    // Refrescar usuario al iniciar
    this.authService.refrescarUsuario();

    // Iniciar fecha y hora
    this.actualizarFechaHora();
    this.relojInterval = setInterval(() => this.actualizarFechaHora(), 1000);
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
    this.fotoPerfilSub?.unsubscribe();
    if (this.relojInterval) clearInterval(this.relojInterval);
  }
}
