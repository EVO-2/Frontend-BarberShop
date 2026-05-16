import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { PusherService } from './services/pusher.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Frontend-BarberShop';

  constructor(
    private pusherService: PusherService,
    private authService: AuthService,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Pusher init
  }

  ngOnInit() {
    this.authService.usuario$.subscribe(usuario => {
      if (usuario && usuario.empresaNombre) {
        this.titleService.setTitle(`${usuario.empresaNombre} - Panel`);
        
        if (usuario.empresaLogo) {
          const link: HTMLLinkElement = this.document.querySelector("link[rel*='icon']") || this.document.createElement('link');
          link.type = 'image/png';
          link.rel = 'icon';
          link.href = usuario.empresaLogo;
          this.document.getElementsByTagName('head')[0].appendChild(link);
        }
      } else {
        this.titleService.setTitle('Style Manager SaaS');
      }
    });
  }
}
