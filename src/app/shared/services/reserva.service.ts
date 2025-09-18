// src/app/services/reserva.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  observaciones?: string;  // 🔹 opcional al crear
}

// ✅ Agregar esta interfaz para el payload de reprogramación
export interface ReprogramarCitaPayload {
  fecha: string;
  hora?: string;
  observacion?: string;
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

  // 🔹 Admin/Barbero: obtiene todos los peluqueros
  getPeluqueros(): Observable<any> {
    return this.http.get(`${this.apiUrl}/peluqueros`).pipe(
      tap(res => console.log('[ReservaService] getPeluqueros response:', res))
    );
  }

  // 🔹 Cliente: obtiene solo peluqueros activos con puesto asignado
  getPeluquerosDisponibles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/peluqueros/disponibles`).pipe(
      tap(res => console.log('[ReservaService] getPeluquerosDisponibles response:', res))
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
    const fechaISO = new Date(fecha).toISOString();
    const url = `${this.apiUrl}/citas/por-sede-fecha?sedeId=${encodeURIComponent(sedeId)}&fecha=${encodeURIComponent(fechaISO)}`;
    return this.http.get(url).pipe(
      tap(res => console.log(`[ReservaService] getCitasPorFechaYHora(${sedeId}, ${fechaISO}) response:`, res))
    );
  }

  // ── Nuevo: obtener citas por rango
  getCitasPorRango(sedeId: string, fechaInicio: string, fechaFin: string): Observable<any> {
    const url = `${this.apiUrl}/citas/rango`;
    const params = new HttpParams()
      .set('sedeId', sedeId)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get(url, { params }).pipe(
      tap(res => console.log(`[ReservaService] getCitasPorRango(${sedeId}, ${fechaInicio}, ${fechaFin}) response:`, res))
    );
  }

  // ✅ Nuevo método para traer citas por rango
  obtenerCitasPorRango(fechaInicio: string, fechaFin: string): Observable<any> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<any>(`${this.apiUrl}/rango`, { params });
  }

  // 🔹 Admin/Barbero: actualizar cita completa
  actualizarCita(id: string, fecha: string, hora: string, observaciones?: string): Observable<any> {
    const payload = { fecha, hora, observaciones };
    console.log('[ReservaService] actualizarCita payload:', payload);
    return this.http.put(`${this.apiUrl}/citas/${id}`, payload).pipe(
      tap(res => console.log(`[ReservaService] actualizarCita(${id}) response:`, res))
    );
  }

  /**
   * 🔹 Cliente/Admin: reprogramar cita
   *   - id → cita a reprogramar
   *   - fecha/hora → nueva fecha-hora (ISO)
   *   - observacion → opcional
   */
  reprogramarCita(
    id: string,
    fechaOrPayload: string | ReprogramarCitaPayload,
    hora?: string,
    observacion?: string
  ): Observable<any> {
    let body: any;

    if (typeof fechaOrPayload === 'object' && fechaOrPayload !== null) {
      body = { ...fechaOrPayload };
    } else {
      const fechaSolo = fechaOrPayload;
      if (hora && !fechaSolo.includes('T')) {
        const posibleIso = new Date(`${fechaSolo}T${hora}:00`).toISOString();
        body = { fecha: posibleIso, observacion };
      } else {
        body = { fecha: fechaSolo, observacion };
      }
    }

    console.log('[ReservaService] reprogramarCita payload:', { id, body });
    return this.http.put(`${this.apiUrl}/citas/${id}/reprogramar`, body).pipe(
      tap(res => console.log(`[ReservaService] reprogramarCita(${id}) response:`, res))
    );
  }
}
