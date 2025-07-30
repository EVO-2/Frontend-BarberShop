import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  usuario: any;
  fotoPerfilUrl: string = 'assets/img/default-avatar.png';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
    });

    this.authService.avatarUrl$.subscribe((url) => {
      this.fotoPerfilUrl = url || 'assets/img/default-avatar.png';
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('foto', file);

      this.authService.actualizarPerfil(formData).subscribe({
        next: (res) => {
          this.authService.refrescarUsuario(); // Actualiza datos y avatar
        },
        error: (err) => {
          console.error('Error al actualizar la foto:', err);
        }
      });
    }
  }
}
