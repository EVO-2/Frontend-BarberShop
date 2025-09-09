import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CrearCitaPayload {
  cliente: string;         
  sede: string;            
  peluquero: string;       
  puestoTrabajo: string;   
  servicios: string[];     
  fecha: string;           
  fechaBase: string;       
  hora: string;            
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes`).pipe(
      tap(res => console.log('[ReservaService] getClientes response:', res))
    );
  }

  getPeluqueros(): Observable<any> {
    return this.http.get(`${this.apiUrl}/peluqueros`).pipe(
      tap(res => console.log('[ReservaService] getPeluqueros response:', res))
    );
  }

  getServicios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicios`).pipe(
      tap(res => console.log('[ReservaService] getServicios response:', res))
    );
  }

  getSedes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sedes`).pipe(
      tap(res => console.log('[ReservaService] getSedes response:', res))
    );
  }

  getPuestosPorSede(sedeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/puestos/por-sede/${sedeId}`).pipe(
      tap(res => console.log(`[ReservaService] getPuestosPorSede(${sedeId}) response:`, res))
    );
  }

  crearCita(data: CrearCitaPayload): Observable<any> {
    console.log('[ReservaService] crearCita payload:', data);
    return this.http.post(`${this.apiUrl}/citas`, data).pipe(
      tap(res => console.log('[ReservaService] crearCita response:', res))
    );
  }

  getCitasPorFechaYHora(sedeId: string, fecha: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/citas/por-sede-fecha?sedeId=${sedeId}&fecha=${fecha}`).pipe(
      tap(res => console.log(`[ReservaService] getCitasPorFechaYHora(${sedeId}, ${fecha}) response:`, res))
    );
  }
}
