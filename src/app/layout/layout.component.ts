import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode'; // ✅ Import correcto

interface RutaAdmin {
  path: string;
  nombre: string;
  icono: string;
  colorClase: string;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  rol: string = '';
  rutasAdmin: RutaAdmin[] = [];

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const payload: any = jwtDecode(token); // ✅ Uso correcto
      this.rol = payload.rol;

      if (this.rol === 'admin') {
        this.rutasAdmin = [
          { path: '/admin/dashboard', nombre: 'Dashboard', icono: 'dashboard', colorClase: 'color-dashboard' },
          { path: '/admin/usuarios', nombre: 'Usuarios', icono: 'group', colorClase: 'color-usuarios' },
          { path: '/admin/clientes', nombre: 'Clientes', icono: 'person', colorClase: 'color-clientes' },
          { path: '/admin/barberos', nombre: 'Barberos', icono: 'content_cut', colorClase: 'color-barberos' },
          { path: '/admin/servicios', nombre: 'Servicios', icono: 'design_services', colorClase: 'color-servicios' },
          { path: '/admin/citas', nombre: 'Citas', icono: 'event', colorClase: 'color-citas' },
          { path: '/admin/reportes', nombre: 'Reportes', icono: 'bar_chart', colorClase: 'color-reportes' }
        ];
      }
    }
  }
}
