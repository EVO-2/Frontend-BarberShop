// src/app/shared/services/menu.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private menu = [

    { label: 'Dashboard SaaS', ruta: '/superadmin/dashboard', icono: 'dashboard', roles: ['superadmin'] },
    { label: 'Dashboard', ruta: '/dashboard', icono: 'dashboard', roles: ['admin'] },
    { label: 'Servicios', ruta: '/servicios', icono: 'content_cut', roles: ['cliente', 'admin'] },
    { label: 'Tienda', ruta: '/tienda', icono: 'shopping_bag', roles: ['cliente', 'barbero', 'manicurista', 'admin'] },
    { label: 'Usuarios', ruta: '/usuarios', icono: 'people', roles: ['admin'] },
    { label: 'Reservar Cita', ruta: '/reservar', icono: 'event', roles: ['cliente', 'admin'] },
    { label: 'Mis Citas', ruta: '/mis-citas', icono: 'calendar_month', roles: ['cliente', 'barbero', 'manicurista', 'admin'] },
    { label: 'Mis Recompensas', ruta: '/mis-recompensas', icono: 'card_giftcard', roles: ['cliente'] },
    { label: 'Gestionar Citas', ruta: '/gestionar-citas', icono: 'content_cut', roles: ['barbero', 'manicurista', 'admin'] },
    { label: 'Comisiones', ruta: '/comisiones', icono: 'attach_money', roles: ['admin', 'barbero', 'manicurista'] },
    { label: 'Reportes', ruta: '/reportes/ingresos', icono: 'bar_chart', roles: ['admin'] },
    { label: 'Mi Suscripción', ruta: '/suscripciones', icono: 'star', roles: ['admin'] },

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
        { label: 'Categorías', ruta: '/categorias', icono: 'category' },
        { label: 'Proveedores', ruta: '/proveedores', icono: 'local_shipping' },
        { label: 'Roles', ruta: '/roles', icono: 'admin_panel_settings' },
        { label: 'Auditoría', ruta: '/auditoria', icono: 'security' },
        { label: 'Ajustes', ruta: '/ajustes-empresa', icono: 'settings_applications' }
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