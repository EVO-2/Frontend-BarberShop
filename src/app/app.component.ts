import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend-barberia';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.authService.obtenerToken();

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiraEn = payload.exp * 1000;

        if (Date.now() > expiraEn) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
        }
      } catch (e) {
        console.warn('⚠️ Token inválido o corrupto en app.component');
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    }
  }
}
