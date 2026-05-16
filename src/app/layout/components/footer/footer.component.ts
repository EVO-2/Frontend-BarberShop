import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  empresaNombre: string = 'Style Manager';
  empresaLogo: string = 'assets/sede.png';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.empresaNombre = usuario.empresaNombre || 'Style Manager';
        this.empresaLogo = usuario.empresaLogo || 'assets/sede.png';
      }
    });
  }
}
