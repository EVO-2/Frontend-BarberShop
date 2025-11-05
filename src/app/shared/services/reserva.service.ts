// src/app/services/reserva.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  observaciones?: string;
}

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
    return this.http.get(`${this.apiUrl}/clientes`);
  }

  getPeluqueros(): Observable<any> {
    return this.http.get(`${this.apiUrl}/peluqueros`);
  }

  getPeluquerosDisponibles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/peluqueros/disponibles`);
  }

  getServicios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicios`);
  }

  getSedes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sedes`);
  }

  getPuestosPorSede(sedeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/puestos/por-sede/${sedeId}`);
  }

  crearCita(data: CrearCitaPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas`, data);
  }

  getCitasPorFechaYHora(sedeId: string, fecha: string): Observable<any> {
    const fechaISO = new Date(fecha).toISOString();
    const url = `${this.apiUrl}/citas/por-sede-fecha?sedeId=${encodeURIComponent(sedeId)}&fecha=${encodeURIComponent(fechaISO)}`;
    return this.http.get(url);
  }

  getCitasPorRango(sedeId: string, fechaInicio: string, fechaFin: string): Observable<any> {
    const url = `${this.apiUrl}/citas/rango`;
    const params = new HttpParams()
      .set('sedeId', sedeId)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get(url, { params });
  }

  obtenerCitasPorRango(fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<any>(`${this.apiUrl}/rango`, { params });
  }

  actualizarCita(id: string, fecha: string, hora: string, observaciones?: string): Observable<any> {
    const payload = { fecha, hora, observaciones };
    return this.http.put(`${this.apiUrl}/citas/${id}`, payload);
  }

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

    return this.http.put(`${this.apiUrl}/citas/${id}/reprogramar`, body);
  }
}
