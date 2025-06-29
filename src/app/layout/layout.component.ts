import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  usuario: any;

  constructor(private router: Router) {
    const userData = localStorage.getItem('user');
    this.usuario = userData ? JSON.parse(userData) : null;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
