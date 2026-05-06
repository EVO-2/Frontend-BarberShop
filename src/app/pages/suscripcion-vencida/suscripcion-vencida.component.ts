import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-suscripcion-vencida',
  templateUrl: './suscripcion-vencida.component.html',
  styleUrls: ['./suscripcion-vencida.component.scss']
})
export class SuscripcionVencidaComponent implements OnInit {

  usuario: any;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioActual();
  }

  // Eventualmente este botón llamará a la pasarela de pagos (Paso 5)
  irAPagar() {
    // Por ahora podemos intentar simular un cobro o redirigir
    console.log('Iniciando proceso de pago...');
    // Cuando hagamos el Paso 5, aquí conectaremos Wompi o ePayco.
  }

  cerrarSesion() {
    this.authService.logout();
  }

}
