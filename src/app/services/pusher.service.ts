import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  private pusher: Pusher;
  private channel: any;

  // Emisor de eventos para que los componentes se suscriban
  public pagoReportado$ = new Subject<any>();

  constructor(
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    // Inicializar Pusher con la KEY PÚBLICA que coincide con el Backend
    this.pusher = new Pusher('049a3980d2403117231d', { 
      cluster: 'us2'
    });

    // Suscribirnos al canal que creamos en el backend
    this.channel = this.pusher.subscribe('barberia-channel');

    // Escuchar el evento 'nueva-cita'
    this.escucharNuevasCitas();

    // Escuchar el evento 'recordatorio-cita'
    this.escucharRecordatoriosCitas();

    // Escuchar pagos reportados
    this.escucharPagosReportados();
  }

  private escucharNuevasCitas() {
    this.channel.bind('nueva-cita', (data: any) => {
      
      const rol = this.authService.obtenerRol();
      const miUsuario = this.authService.getUsuarioActual();
      
      // Las alertas de nueva cita y recordatorios son EXCLUSIVAS para el personal
      if (rol !== 'admin' && rol !== 'barbero' && rol !== 'peluquero' && rol !== 'manicurista') {
        return;
      }
      
      // Si no es admin, validar que la cita le pertenezca a él
      if (rol !== 'admin') {
        const miPeluqueroId = miUsuario?.peluquero?._id || miUsuario?.peluquero || miUsuario?._id;
        if (data.peluqueroId && String(miPeluqueroId) !== String(data.peluqueroId)) {
          return; // La cita es de otro barbero, no mostrar
        }
      }
      
      // 1. Mostrar una alerta bonita en la esquina de la pantalla
      this.toastr.success(`Hora: ${data.hora}`, data.mensaje, {
        timeOut: 8000,
        progressBar: true,
        positionClass: 'toast-top-right' // O la esquina que prefieras
      });

      // 2. Opcional: Mostrar un PopUp grande con el botón de WhatsApp
      if (data.linkWhatsAppCliente) {
        Swal.fire({
          title: '¡Nueva Cita!',
          text: `${data.mensaje} - ${data.fecha} a las ${data.hora}`,
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Confirmar por WhatsApp',
          cancelButtonText: 'Cerrar',
          confirmButtonColor: '#25D366' // Color de WhatsApp
        }).then((result) => {
          if (result.isConfirmed) {
            // Abrir el link de WhatsApp en una pestaña nueva
            window.open(data.linkWhatsAppCliente, '_blank');
          }
        });
      }
    });
  }

  private escucharRecordatoriosCitas() {
    this.channel.bind('recordatorio-cita', (data: any) => {
      
      const rol = this.authService.obtenerRol();
      const miUsuario = this.authService.getUsuarioActual();

      if (rol !== 'admin' && rol !== 'barbero' && rol !== 'peluquero' && rol !== 'manicurista') {
        return;
      }

      // Si no es admin, validar que la cita le pertenezca a él
      if (rol !== 'admin') {
        const miPeluqueroId = miUsuario?.peluquero?._id || miUsuario?.peluquero || miUsuario?._id;
        if (data.peluqueroId && String(miPeluqueroId) !== String(data.peluqueroId)) {
          return; // La cita es de otro barbero, no mostrar
        }
      }

      // 1. Mostrar una alerta bonita en la esquina de la pantalla
      this.toastr.warning(`Hora: ${data.hora}`, data.mensaje, {
        timeOut: 10000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });

      // 2. Mostrar un PopUp grande con el botón de WhatsApp
      if (data.linkWhatsAppCliente) {
        Swal.fire({
          title: '⏰ ¡Recordatorio Inminente!',
          text: `${data.mensaje} - Cita a las ${data.hora}`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Enviar Recordatorio (WhatsApp)',
          cancelButtonText: 'Cerrar',
          confirmButtonColor: '#25D366' // Color de WhatsApp
        }).then((result) => {
          if (result.isConfirmed) {
            // Abrir el link de WhatsApp en una pestaña nueva
            window.open(data.linkWhatsAppCliente, '_blank');
          }
        });
      }
    });
  }

  private escucharPagosReportados() {
    this.channel.bind('pago-reportado', (data: any) => {
      console.log('📢 [Pusher] pago-reportado recibido:', data);
      
      const rol = this.authService.obtenerRol();
      const miUsuario = this.authService.getUsuarioActual();

      // Siempre emitimos el evento para que las tablas se refresquen si están abiertas
      this.pagoReportado$.next(data);

      if (rol !== 'admin' && rol !== 'barbero' && rol !== 'peluquero' && rol !== 'manicurista') {
        return;
      }

      // Si no es admin, validar que la cita le pertenezca a él para mostrar la alerta
      if (rol !== 'admin') {
        const miPeluqueroId = miUsuario?.peluquero?._id || miUsuario?.peluquero || miUsuario?._id;
        if (data.peluqueroId && String(miPeluqueroId) !== String(data.peluqueroId)) {
          return; // La cita es de otro barbero, no mostrar Toastr
        }
      }

      // 1. Notificar visualmente
      this.toastr.info(`Ref: ${data.observaciones || 'Sin referencia'}`, data.mensaje, {
        timeOut: 8000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
    });
  }
}
