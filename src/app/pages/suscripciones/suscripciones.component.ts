import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

declare var WidgetCheckout: any; // Wompi Widget

@Component({
  selector: 'app-suscripciones',
  templateUrl: './suscripciones.component.html',
  styleUrls: ['./suscripciones.component.scss']
})
export class SuscripcionesComponent implements OnInit {
  apiUrl = environment.apiUrl;
  usuario: any = null;
  empresaId: string = '';
  suscripcionEstado: string = 'trial';
  planActual: string = 'trial';
  cargando: boolean = false;

  planes = [
    {
      nombre: 'BÁSICO',
      precio: 35000,
      precioStr: '$35.000',
      descripcion: 'Ideal para barberías pequeñas.',
      caracteristicas: [
        'Hasta 3 barberos',
        'Agenda de citas básica',
        'Gestión de clientes',
        'Soporte por email'
      ],
      recomendado: false
    },
    {
      nombre: 'PRO',
      precio: 75000,
      precioStr: '$75.000',
      descripcion: 'Para barberías en crecimiento.',
      caracteristicas: [
        'Hasta 10 barberos',
        'Agenda avanzada y reportes',
        'Gestión de inventario',
        'Soporte prioritario'
      ],
      recomendado: true
    },
    {
      nombre: 'PREMIUM',
      precio: 120000,
      precioStr: '$120.000',
      descripcion: 'El paquete completo con automatización.',
      caracteristicas: [
        'Barberos ilimitados',
        'Múltiples sucursales',
        'Bot de WhatsApp para citas',
        'Soporte 24/7'
      ],
      recomendado: false
    }
  ];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const usrStr = localStorage.getItem('usuario');
    if (usrStr) {
      this.usuario = JSON.parse(usrStr);
      // Asume que la empresaId está en el usuario, pero lo ideal es consultar el perfil
    }

    // Consultamos el perfil real para obtener el estado de la empresa
    this.http.get<any>(`${this.apiUrl}/api/usuarios/perfil`).subscribe({
      next: (res) => {
        if (res.usuario && res.usuario.empresaId) {
          this.empresaId = res.usuario.empresaId._id || res.usuario.empresaId;
          this.suscripcionEstado = res.usuario.empresaId.suscripcionEstado || 'trial';
          this.planActual = res.usuario.empresaId.plan || 'trial';
        }
      },
      error: (err) => console.error('Error al obtener perfil', err)
    });
  }

  iniciarPago(plan: any) {
    this.cargando = true;
    const referencia = `SUB-${this.empresaId}-${Date.now()}`;
    const monto_en_centavos = plan.precio * 100;
    const moneda = 'COP';

    // 1. Solicitar firma de integridad al backend
    this.http.post<any>(`${this.apiUrl}/api/wompi/firma`, {
      referencia,
      monto_en_centavos,
      moneda
    }).subscribe({
      next: (res) => {
        const firma = res.firma;
        this.abrirWidgetWompi(plan, referencia, monto_en_centavos, firma);
      },
      error: (err) => {
        this.cargando = false;
        this.snackBar.open('Error al generar transacción segura.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  abrirWidgetWompi(plan: any, referencia: string, monto_en_centavos: number, signature: string) {
    // 2. Obtener la llave pública
    this.http.get<any>(`${this.apiUrl}/api/wompi/keys`).subscribe({
      next: (res) => {
        this.cargando = false;
        const checkout = new WidgetCheckout({
          currency: 'COP',
          amountInCents: monto_en_centavos,
          reference: referencia,
          publicKey: res.publicKey,
          signature: { integrity: signature },
          redirectUrl: window.location.href, // Redirige aquí mismo tras el pago
          customerData: {
            email: this.usuario?.correo,
            fullName: this.usuario?.nombre
          }
        });

        checkout.open((result: any) => {
          const transaction = result.transaction;
          if (transaction.status === 'APPROVED') {
            this.snackBar.open('¡Pago exitoso! Tu suscripción ha sido activada.', 'Cerrar', { duration: 5000 });
            this.suscripcionEstado = 'activa';
            this.planActual = plan.nombre;
          } else {
            this.snackBar.open(`Transacción ${transaction.status}.`, 'Cerrar', { duration: 5000 });
          }
        });
      },
      error: (err) => {
        this.cargando = false;
        this.snackBar.open('No se pudo conectar con la pasarela de pagos.', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
