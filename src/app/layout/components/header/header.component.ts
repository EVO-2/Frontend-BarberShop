import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/interfaces/usuario.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  usuario: Usuario | null = null;
  fotoPerfilUrl: string = 'assets/img/default-avatar.png';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse al usuario logueado
    this.authService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
    });

    // Suscribirse al avatar
    this.authService.avatarUrl$.subscribe((url) => {
      this.fotoPerfilUrl = url || 'assets/img/default-avatar.png';
    });

    // Refrescar usuario al iniciar
    this.authService.refrescarUsuario();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) return;

      const formData = new FormData();
      formData.append('foto', file);

      this.authService.actualizarPerfil(formData).subscribe({
        next: () => this.authService.refrescarUsuario(),
        error: (err) => console.error('Error al actualizar la foto:', err)
      });
    }
  }
}
