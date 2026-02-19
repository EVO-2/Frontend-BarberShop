import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { EquipoMovimiento } from 'src/app/shared/models/equipo-movimiento.model';

interface PagedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  totalPages?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EquipoMovimientoService {

  /** RUTA BASE DE EQUIPOS */
  private baseUrl = `${environment.apiUrl}/equipos`;

  constructor(private http: HttpClient) { }

  /**
   * Crear movimiento de un equipo
   * POST /api/equipos/:id/movimientos
   */
  crearMovimiento(equipoId: string, data: Partial<EquipoMovimiento>): Observable<EquipoMovimiento> {
    return this.http.post<{ data: EquipoMovimiento }>(`${this.baseUrl}/${equipoId}/movimientos`, data).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Listar movimientos de un equipo
   * GET /api/equipos/:id/movimientos
   */
  listarPorEquipo(equipoId: string): Observable<EquipoMovimiento[]> {
    return this.http.get<{ data: EquipoMovimiento[] }>(`${this.baseUrl}/${equipoId}/movimientos`).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener un movimiento por ID
   * GET /api/movimientos/:id (opcional, si implementas endpoint global)
   */
  obtenerPorId(id: string): Observable<EquipoMovimiento> {
    return this.http.get<{ data: EquipoMovimiento }>(`${environment.apiUrl}/movimientos/${id}`).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any) {
    console.error('EquipoMovimientoService error:', error);
    const message = error?.error?.mensaje || error?.message || 'Error en petición';
    return throwError(() => ({ message, original: error }));
  }
}
