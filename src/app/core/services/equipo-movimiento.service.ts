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

  /** 
   * RUTA BASE CORRECTA → /api/equipos
   */
  private baseUrl = `${environment.apiUrl}/equipos`;

  constructor(private http: HttpClient) {}

  /**
   * Crear movimiento de un equipo
   */
  crearMovimiento(equipoId: string, data: Partial<EquipoMovimiento>): Observable<EquipoMovimiento> {
    return this.http.post<{ data: EquipoMovimiento }>(`${this.baseUrl}/${equipoId}/movimientos`, data).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Listar movimientos GLOBALMENTE (no por equipo)
   * `/api/movimientos`
   */
  listar(params?: {
    page?: number;
    limit?: number;
    equipo?: string;
    tipo?: string;
    sede?: string;
    responsable?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Observable<PagedResponse<EquipoMovimiento>> {

    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<PagedResponse<EquipoMovimiento>>(
      `${environment.apiUrl}/movimientos`,
      { params: httpParams }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Listar movimientos SOLO de un equipo
   * Ruta correcta → /api/equipos/:id/movimientos
   */
  listarPorEquipo(equipoId: string): Observable<EquipoMovimiento[]> {
    return this.http.get<{ data: EquipoMovimiento[] }>(`${this.baseUrl}/${equipoId}/movimientos`).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener un movimiento por ID
   * Ruta correcta → /api/movimientos/:id
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
