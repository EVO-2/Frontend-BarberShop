import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  
  // Llave VAPID Pública (igual que en backend)
  private readonly VAPID_PUBLIC_KEY = 'BCPrerzZwG4YNbXv4SgFPjSENfeiwbOVtvD2BqTtHg92wUWcjuPUeAteU4K2wQg6Jq3TI2g26efsDbdURnlMT3Q';

  constructor(
    private swPush: SwPush,
    private http: HttpClient
  ) {}

  public requestSubscription() {
    if (!this.swPush.isEnabled) {
      console.warn('Los Service Workers no están habilitados o soportados por el navegador.');
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      // Enviar la suscripción al backend
      this.http.post(`${environment.apiUrl}/api/notificaciones/subscribe`, sub)
        .subscribe({
          next: () => console.log('✅ Suscripción Web Push guardada en el servidor.'),
          error: (err) => console.error('❌ Error enviando suscripción al servidor:', err)
        });
    })
    .catch(err => console.error('No se pudo suscribir a notificaciones push:', err));
  }
}
