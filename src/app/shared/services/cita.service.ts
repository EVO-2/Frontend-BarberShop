import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Cita } from '../models/cita.model';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  // ==============================
  // Métodos de cliente
  // ==============================
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
      const f = new Date(fecha);
      if (!isNaN(f.getTime())) {
        const inicio = new Date(f);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(f);
        fin.setHours(23, 59, 59, 999);

        params = params.set(
          'fecha',
          JSON.stringify({ inicio: inicio.toISOString(), fin: fin.toISOString() })
        );
      }
    }

    if (rol) params = params.set('rol', rol);
    if (filtroGeneral?.trim()) params = params.set('filtroGeneral', filtroGeneral.trim());

    return this.http
      .get<{ total: number; page: number; totalPages: number; citas: Cita[] }>(
        `${this.apiUrl}/mis-citas`,
        { params }
      )
      .pipe(catchError(err => throwError(() => err)));
  }

  // ==============================
// Métodos de administración
// ==============================
// ==============================
// Métodos de administración
// ==============================
obtenerCitasPaginadas(
  page: number,
  limit: number,
  filtros?: any
): Observable<any> {
  let params: any = { page: page.toString(), limit: limit.toString() };

  if (filtros) {
    if (filtros.cliente) {
      params.cliente = filtros.cliente;
    }

    if (filtros.fecha) {
      // 👉 Caso 1: viene un string (ej: '2025-09-26')
      if (typeof filtros.fecha === 'string') {
        const fecha = new Date(filtros.fecha);
        if (!isNaN(fecha.getTime())) {
          const inicio = new Date(fecha);
          inicio.setHours(0, 0, 0, 0);
          const fin = new Date(fecha);
          fin.setHours(23, 59, 59, 999);

          params.fecha = JSON.stringify({
            inicio: inicio.toISOString(),
            fin: fin.toISOString()
          });
        }
      }

      // 👉 Caso 2: viene como rango { inicio, fin }
      else if (typeof filtros.fecha === 'object' && filtros.fecha.inicio && filtros.fecha.fin) {
        const inicio = new Date(filtros.fecha.inicio);
        const fin = new Date(filtros.fecha.fin);

        if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
          inicio.setHours(0, 0, 0, 0);
          fin.setHours(23, 59, 59, 999);

          params.fecha = JSON.stringify({
            inicio: inicio.toISOString(),
            fin: fin.toISOString()
          });
        }
      }
    }

    if (filtros.filtroGeneral?.trim()) {
      params.filtroGeneral = filtros.filtroGeneral.trim();
    }
  }

  return this.http
    .get<any>(`${this.apiUrl}/paginadas`, { params })
    .pipe(catchError(err => throwError(() => err)));
}


  // ==============================
  // Métodos de gestión
  // ==============================
  actualizarCita(id: string, fecha: string, hora: string): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, { fecha, hora })
      .pipe(catchError(err => throwError(() => err)));
  }

  getCitasPorSedeYFecha(sedeId: string, fecha: string): Observable<Cita[]> {
    if (!sedeId || !fecha) throw new Error('Faltan parámetros');
    const f = new Date(fecha);
    if (isNaN(f.getTime())) throw new Error('Fecha inválida');

    const params = new HttpParams()
      .set('sedeId', sedeId)
      .set('fecha', f.toISOString().split('T')[0]);

    return this.http.get<Cita[]>(`${this.apiUrl}/por-sede-fecha`, { params })
      .pipe(catchError(err => throwError(() => err)));
  }

  getCitasPorRango(sedeId: string, fechaInicio: string, fechaFin: string): Observable<Cita[]> {
    if (!sedeId || !fechaInicio || !fechaFin) throw new Error('Faltan parámetros');

    const fInicio = new Date(fechaInicio);
    const fFin = new Date(fechaFin);
    if (isNaN(fInicio.getTime()) || isNaN(fFin.getTime())) throw new Error('Fechas inválidas');

    const params = new HttpParams()
      .set('sedeId', sedeId)
      .set('fechaInicio', fInicio.toISOString().split('T')[0])
      .set('fechaFin', fFin.toISOString().split('T')[0]);

    return this.http.get<Cita[]>(`${this.apiUrl}/rango`, { params })
      .pipe(catchError(err => throwError(() => err)));
  }

  obtenerServicios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/servicios`)
      .pipe(catchError(err => throwError(() => err)));
  }

  // ==============================
  // Métodos de gestión de estado de Citas
  // ==============================
  iniciarCita(
    citaId: number | string,
    peluqueroId: number | string,
    hora?: string
  ): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${citaId}/iniciar`, { peluqueroId, hora })
      .pipe(catchError(err => throwError(() => err)));
  }

  finalizarCita(
    citaId: number | string,
    peluqueroId: number | string,
    hora?: string,
    notas?: string
  ): Observable<Cita> {
    const payload: any = { peluqueroId };
    if (hora && hora.trim() !== '') payload.hora = hora.trim();
    if (notas && notas.trim() !== '') payload.notas = notas.trim();

    return this.http.put<Cita>(`${this.apiUrl}/${citaId}/finalizar`, payload)
      .pipe(catchError(err => throwError(() => err)));
  }

  cancelarCita(citaId: number | string, razon?: string): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${citaId}/cancelar`, { razon })
      .pipe(catchError(err => throwError(() => err)));
  }
}
