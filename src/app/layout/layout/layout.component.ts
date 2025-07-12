import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  nombreUsuario = '';
  fotoPerfil   = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioInfo();
    if (usuario) {
      this.nombreUsuario = usuario.nombre;
      this.fotoPerfil   = usuario.foto;   // puede ser '' si aún no tiene foto
    }
  }

  /** Navega al componente de edición de perfil (lo crearás más adelante) */
  editarPerfil(): void {
    this.router.navigate(['/perfil']);
  }
}
