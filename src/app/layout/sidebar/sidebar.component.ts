import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

interface MenuItem {
  label: string;
  ruta: string;
  icono: string;
  roles: string[]; // roles que pueden ver esta opción
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  rol: string = '';
  menu: MenuItem[] = [];

  constructor(private authService: AuthService) {
    this.rol = this.authService.obtenerRol();

    this.menu = [
      { label: 'Usuarios', ruta: '/usuarios', icono: 'people', roles: ['admin'] },
      { label: 'Reservar Cita', ruta: '/reservar', icono: 'event', roles: ['cliente'] },
      { label: 'Mis Citas', ruta: '/mis-citas', icono: 'calendar_month', roles: ['cliente', 'barbero'] },
      { label: 'Reportes', ruta: '/reportes', icono: 'bar_chart', roles: ['admin'] },
      { label: 'Configuración', ruta: '/configuracion', icono: 'settings', roles: ['admin', 'cliente', 'barbero'] },
    ];
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    location.href = '/login';
  }

  puedeVer(item: MenuItem): boolean {
    return item.roles.includes(this.rol);
  }
}
