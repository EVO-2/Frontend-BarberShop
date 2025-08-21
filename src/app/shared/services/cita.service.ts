import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cita } from '../models/cita.model';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  // Obtener las citas del usuario autenticado
  obtenerMisCitas(page: number = 1, limit: number = 10, fecha?: string): Observable<{ total: number, page: number, totalPages: number, citas: Cita[] }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (fecha) {
      params = params.set('fecha', fecha);
    }

    return this.http.get<{ total: number, page: number, totalPages: number, citas: Cita[] }>(`${this.apiUrl}/mis-citas`, { params });
  }

  // Actualizar una cita
  actualizarCita(id: string, data: any): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, data);
  }

  // Obtener citas por fecha y hora
  getCitasPorFechaYHora(sedeId: string, fecha: string, hora: string): Observable<Cita[]> {
    const params = new HttpParams()
      .set('sedeId', sedeId)
      .set('fecha', fecha)
      .set('hora', hora);

    return this.http.get<Cita[]>(`${this.apiUrl}/por-fecha-hora`, { params });
  }

  // Obtener citas en un rango de fechas
  getCitasPorRango(sedeId: string, fechaInicio: string, fechaFin: string): Observable<Cita[]> {
    if (!sedeId || !fechaInicio || !fechaFin) {
      throw new Error('Faltan parámetros para obtener citas por rango');
    }

    const params = new HttpParams()
      .set('sedeId', sedeId)
      .set('fechaInicio', new Date(fechaInicio).toISOString())
      .set('fechaFin', new Date(fechaFin).toISOString());

    return this.http.get<Cita[]>(`${this.apiUrl}/rango`, { params });
  }

  // 🔹 NUEVO: Obtener todos los servicios disponibles
  obtenerServicios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/servicios`);
  }
}
