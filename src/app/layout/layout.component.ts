import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  usuario = JSON.parse(localStorage.getItem('user') || '{}');

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
