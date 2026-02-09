import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/interfaces/usuario.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  usuario: Usuario | null = null;
  avatarUrl: string = 'assets/img/default-avatar.png';
  horaActual: string = '';
  fechaActual: string = '';

  isMobile = false; // State to track mobile view

  private usuarioSub!: Subscription;
  private fotoPerfilSub!: Subscription;
  private relojInterval!: ReturnType<typeof setInterval>;

  constructor(
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private observer: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // Monitor screen size
    this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
      this.isMobile = res.matches;
    });

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

  // Called when a link is clicked in the sidebar
  onSidenavEntryClick() {
    if (this.isMobile) {
      this.drawer.close();
    }
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
