import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  rol: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.rol = this.authService.getRol(); // obtiene el rol del usuario logueado
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // redirige al login tras cerrar sesión
  }
}
