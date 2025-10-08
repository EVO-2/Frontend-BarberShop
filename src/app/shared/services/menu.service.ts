// src/app/shared/services/menu.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menu = [
    { label: 'Dashboard', ruta: '/dashboard', icono: 'dashboard', roles: ['admin'] },
    { label: 'Usuarios', ruta: '/usuarios', icono: 'people', roles: ['admin'] },
    { label: 'Reservar Cita', ruta: '/reservar', icono: 'event', roles: ['cliente', 'admin'] },
    { label: 'Mis Citas', ruta: '/mis-citas', icono: 'calendar_month', roles: ['cliente', 'barbero', 'admin'] },
    { label: 'Gestionar Citas', ruta: '/gestionar-citas', icono: 'content_cut', roles: ['barbero', 'admin'] },
    { label: 'Reportes', ruta: '/reportes', icono: 'bar_chart', roles: ['admin'] },
    {
      label: 'Configuración',
      icono: 'settings',
      roles: ['admin'],
      children: [
        { label: 'Sedes', ruta: 'sedes', icono: 'store' },
        { label: 'Puestos de Trabajo', ruta: 'puestos', icono: 'chair' },
        { label: 'Servicios', ruta: 'servicios', icono: 'build' },
      ]
    }
  ];

  constructor() {}

  getMenuPorRol(rol: string) {
    return this.menu.filter(item => item.roles.includes(rol));
  }
}
