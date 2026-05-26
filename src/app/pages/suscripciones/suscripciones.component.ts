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
      precio: 45000,
      precioStr: '$45.000',
      descripcion: 'Ideal para barberías pequeñas.',
      caracteristicas: [
        'Hasta 3 profesionales',
        'Logo de empresa dinámico',
        'Gestión de clientes',
        'Soporte por email'
      ],
      recomendado: false
    },
    {
      nombre: 'PRO',
      precio: 89000,
      precioStr: '$89.000',
      descripcion: 'Para barberías en crecimiento.',
      caracteristicas: [
        'Hasta 10 profesionales',
        'Reportes con tu propia marca',
        'Gestión de inventario',
        'Soporte prioritario'
      ],
      recomendado: true
    },
    {
      nombre: 'PREMIUM',
      precio: 150000,
      precioStr: '$150.000',
      descripcion: 'El paquete completo con automatización.',
      caracteristicas: [
        'Profesionales ilimitados',
        'Múltiples sucursales (Marca Blanca)',
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
    this.verificarRetornoPago();
  }

  cargarDatosUsuario() {
    const usrStr = localStorage.getItem('usuario');
    if (usrStr) {
      this.usuario = JSON.parse(usrStr);
    }

    // Consultamos el perfil real para obtener el estado de la empresa
    this.http.get<any>(`${this.apiUrl}/usuarios/perfil`).subscribe({
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

  verificarRetornoPago() {
    const params = new URLSearchParams(window.location.search);
    const transaccionId = params.get('id');
    if (transaccionId) {
      this.snackBar.open('Tu pago está siendo procesado por Wompi. La suscripción se activará automáticamente en unos segundos.', 'Cerrar', { duration: 7000 });
      // Limpiar los query parameters de la URL para estética de la SPA
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  iniciarPago(plan: any) {
    this.cargando = true;

    // Sanitizar nombre de plan (remover acentos y convertir a minúsculas, ej: "BÁSICO" -> "basico")
    const planNombreSeguro = plan.nombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const referencia = `SUB-${this.empresaId}-${planNombreSeguro}-${Date.now()}`;
    const monto_en_centavos = plan.precio * 100;
    const moneda = 'COP';

    // 1. Solicitar firma de integridad al backend
    this.http.post<any>(`${this.apiUrl}/wompi/firma`, {
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
    // 2. Obtener la llave pública del comercio
    this.http.get<any>(`${this.apiUrl}/wompi/keys`).subscribe({
      next: (res) => {
        this.cargando = false;
        
        // 3. Generar la URL de redirección del checkout de Wompi
        // Omitimos redirect-url si estamos en localhost para evitar que el Firewall (WAF) de Wompi bloquee con 403
        const esLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const redirectParam = esLocal 
          ? '' 
          : `&redirect-url=${encodeURIComponent(window.location.origin + '/suscripciones')}`;
          
        const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${res.publicKey}&currency=COP&amount-in-cents=${monto_en_centavos}&reference=${referencia}${redirectParam}&signature:integrity=${signature}`;
        
        console.log('⚡ Redirigiendo a Wompi Checkout seguro:', checkoutUrl);
        
        // Redireccionar al usuario para evitar cualquier error de iframe/scroll
        window.location.href = checkoutUrl;
      },
      error: (err) => {
        this.cargando = false;
        this.snackBar.open('No se pudo conectar con la pasarela de pagos.', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
