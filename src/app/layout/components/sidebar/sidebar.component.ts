import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuService } from 'src/app/shared/services/menu.service';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('submenuToggle', [
      state('closed', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('open', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden'
      })),
      transition('closed <=> open', [
        animate('250ms ease-in-out')
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit {
  menuItems: any[] = [];
  usuario: Usuario | null = null;
  expandedItem: string | null = null; // controla qué menú está expandido

  constructor(
    public authService: AuthService,
    private menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario: Usuario | null) => {
      this.usuario = usuario;

      if (usuario?.rol) {
        const rol = typeof usuario.rol === 'string' ? usuario.rol : usuario.rol.nombre;
        this.menuItems = this.menuService.getMenuPorRol(rol);
      } else {
        this.menuItems = [];
      }
    });
  }

  toggleSubmenu(label: string): void {
    this.expandedItem = this.expandedItem === label ? null : label;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
