import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuService } from 'src/app/shared/services/menu.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: any[] = [];

  constructor(
    public authService: AuthService,
    private menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe(usuario => {
      if (usuario?.rol) {
        this.menuItems = this.menuService.getMenuPorRol(usuario.rol);
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout(); // asegúrate de tener este método en el AuthService
    this.router.navigate(['/login']);
  }
}
