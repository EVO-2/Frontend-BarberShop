import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Cita } from '../models/cita.model';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  obtenerMisCitas(
    page: number = 1,
    limit: number = 10,
    fecha?: string,
    rol?: string,
    filtroGeneral?: string
  ): Observable<{ total: number; page: number; totalPages: number; citas: Cita[] }> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (fecha) {
      const fechaISO = new Date(fecha).toISOString();
      params = params.set('fecha', fechaISO);
    }

    if (rol) {
      params = params.set('rol', rol);
    }

    if (filtroGeneral && filtroGeneral.trim().length > 0) {
      params = params.set('filtroGeneral', filtroGeneral.trim());
    }

    return this.http.get<{ total: number; page: number; totalPages: number; citas: Cita[] }>(
      `${this.apiUrl}/mis-citas`,
      { params }
    ).pipe(
      catchError(err => {
        throw err;
      })
    );
  }

  // Actualizar solo fecha y hora de una cita (admin/barbero)
  actualizarCita(id: string, fecha: string, hora: string): Observable<Cita> {
    const payload = { fecha, hora };
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, payload);
  }

  // Consultar citas por sede y fecha
  getCitasPorSedeYFecha(sedeId: string, fecha: string): Observable<Cita[]> {
    if (!sedeId || !fecha) throw new Error('Faltan parámetros');
    const fechaISO = new Date(fecha).toISOString();
    const params = new HttpParams().set('sedeId', sedeId).set('fecha', fechaISO);
    return this.http.get<Cita[]>(`${this.apiUrl}/por-sede-fecha`, { params });
  }

  // Consultar citas por rango de fechas
  getCitasPorRango(sedeId: string, fechaInicio: string, fechaFin: string): Observable<Cita[]> {
    if (!sedeId || !fechaInicio || !fechaFin) throw new Error('Faltan parámetros');
    const params = new HttpParams()
      .set('sedeId', sedeId)
      .set('fechaInicio', new Date(fechaInicio).toISOString())
      .set('fechaFin', new Date(fechaFin).toISOString());
    return this.http.get<Cita[]>(`${this.apiUrl}/rango`, { params });
  }

  // Consultar servicios disponibles
  obtenerServicios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/servicios`);
  }
}
