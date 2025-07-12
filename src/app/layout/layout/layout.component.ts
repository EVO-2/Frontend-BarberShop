import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  nombreUsuario = '';
  fotoPerfil = '';
  fechaHoraActual = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioInfo();
    if (usuario) {
      this.nombreUsuario = usuario.nombre;
      this.fotoPerfil = usuario.foto;
    }

    this.actualizarFechaHora();
    setInterval(() => this.actualizarFechaHora(), 1000); // actualiza cada segundo
  }

  actualizarFechaHora() {
    const now = new Date();
    this.fechaHoraActual = now.toLocaleString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota'
    });
  }

  editarPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
