import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComisionesService {
  private apiUrl = `${environment.apiUrl}/comisiones`;

  constructor(private http: HttpClient) { }

  // Admin: Obtener comisiones pendientes agrupadas
  getComisionesPendientes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pendientes`);
  }

  // Admin: Pagar comisiones
  pagarComisiones(peluqueroId: string, metodoPago: string, observaciones: string = ''): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pagar`, { peluqueroId, metodoPago, observaciones });
  }

  // Admin: Obtener historial de pagos
  getHistorialPagos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/historial`);
  }

  // Profesional: Obtener mi comisión pendiente
  getMiComision(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mis-comisiones`);
  }

  // Profesional: Obtener historial de mis pagos
  getMiHistorialPagos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mis-pagos`);
  }
}
