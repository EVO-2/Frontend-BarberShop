// src/app/shared/services/menu.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private menu = [

    { label: 'Dashboard', ruta: '/dashboard', icono: 'dashboard', roles: ['admin'] },
    { label: 'Servicios', ruta: '/servicios', icono: 'content_cut', roles: ['cliente', 'admin'] },
    { label: 'Tienda', ruta: '/tienda', icono: 'shopping_bag', roles: ['cliente', 'barbero', 'manicurista', 'admin'] },
    { label: 'Usuarios', ruta: '/usuarios', icono: 'people', roles: ['admin'] },
    { label: 'Reservar Cita', ruta: '/reservar', icono: 'event', roles: ['cliente', 'admin'] },
    { label: 'Mis Citas', ruta: '/mis-citas', icono: 'calendar_month', roles: ['cliente', 'barbero', 'manicurista', 'admin'] },
    { label: 'Gestionar Citas', ruta: '/gestionar-citas', icono: 'content_cut', roles: ['barbero', 'manicurista', 'admin'] },
    { label: 'Reportes', ruta: '/reportes/ingresos', icono: 'bar_chart', roles: ['admin'] },

    {
      label: 'Configuración',
      icono: 'settings',
      roles: ['admin'],
      children: [
        { label: 'Sedes', ruta: '/sedes', icono: 'store' },
        { label: 'Puestos de Trabajo', ruta: '/puestos', icono: 'chair' },
        { label: 'Servicios', ruta: '/servicios-admin', icono: 'build' },
        { label: 'Equipos', ruta: '/equipos', icono: 'inventory_2' },
        { label: 'Productos', ruta: '/productos', icono: 'inventory' },
        { label: 'Roles', ruta: '/roles', icono: 'admin_panel_settings' },
        { label: 'Auditoría', ruta: '/auditoria', icono: 'security' }
      ]
    }

  ];

  constructor() { }

  getMenuPorRol(rol: string) {
    return this.menu
      .filter(item => item.roles.includes(rol))
      .map(item => {
        // 🔥 Filtrar hijos si existen
        if (item.children) {
          return {
            ...item,
            children: item.children
          };
        }
        return item;
      });
  }
}