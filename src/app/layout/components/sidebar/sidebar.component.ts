import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuService } from 'src/app/shared/services/menu.service';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/shared/models/usuario.model';  

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: any[] = [];
  usuario: Usuario | null = null; 

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

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
