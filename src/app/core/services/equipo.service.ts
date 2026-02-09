import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Equipo } from 'src/app/shared/models/equipo.model';
import { environment } from 'src/environments/environment';

interface PagedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  totalPages?: number;
}

/**
 * Servicio para consumir la API de Equipos.
 * Ajusta `environment.apiUrl` si usas otra variable.
 */
@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private baseUrl = `${environment.apiUrl}/equipos`;

  constructor(private http: HttpClient) {}

  /**
   * Listar equipos con filtros y paginación opcionales.
   * params: { page, limit, tipo, sede, estado, q }
   */
  listar(params?: {
    page?: number;
    limit?: number;
    tipo?: string;
    sede?: string;
    estado?: string;
    q?: string;
    activo?: boolean;
  }): Observable<PagedResponse<Equipo>> {
    let httpParams = new HttpParams();
    if (!params) params = {};
    if (params.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params.tipo) httpParams = httpParams.set('tipo', params.tipo);
    if (params.sede) httpParams = httpParams.set('sede', params.sede);
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.activo != null) httpParams = httpParams.set('activo', String(params.activo));

    return this.http.get<PagedResponse<Equipo>>(this.baseUrl, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  /** Obtener un equipo por ID */
  obtenerPorId(id: string): Observable<Equipo> {
    return this.http.get<{ data: Equipo }>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /** Crear un equipo (data = objeto Equipo parcial) */
  crear(data: Partial<Equipo>): Observable<Equipo> {
    return this.http.post<{ data: Equipo }>(this.baseUrl, data).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /** Actualizar equipo */
  actualizar(id: string, data: Partial<Equipo>): Observable<Equipo> {
    return this.http.put<{ data: Equipo }>(`${this.baseUrl}/${id}`, data).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /** Baja lógica / eliminar */
  eliminar(id: string): Observable<{ mensaje?: string }> {
    return this.http.delete<{ mensaje?: string }>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Subir imágenes (opcional).
   * Este método hace un POST con FormData a una URL configurable.
   * Ajusta `uploadUrl` si tu backend expone otro endpoint.
   * - files: FileList | File[]
   * - equipoId opcional (si tu endpoint requiere /api/equipos/:id/upload)
   */
  uploadImages(equipoId: string | null, files: FileList | File[], uploadUrl?: string): Observable<HttpEvent<any>> {
    // Construir FormData
    const form = new FormData();
    if (files && files.length) {
      if ((files as FileList).item) {
        for (let i = 0; i < (files as FileList).length; i++) {
          const f = (files as FileList).item(i);
          if (f) form.append('imagenes', f);
        }
      } else {
        (files as File[]).forEach(f => form.append('imagenes', f));
      }
    }

    // URL por defecto (ajusta si tu backend usa otra ruta)
    const url = uploadUrl ? uploadUrl : (equipoId ? `${this.baseUrl}/${equipoId}/upload` : `${this.baseUrl}/upload`);

    // Usamos HttpRequest para permitir reportes de progreso si quieres
    const req = new HttpRequest('POST', url, form, { reportProgress: true, responseType: 'json' });

    return this.http.request(req).pipe(catchError(this.handleError));
  }

  /**
   * Método auxiliar para manejar errores.
   * Puedes adaptarlo para mostrar snackbars o logs más completos.
   */
  private handleError(error: any) {
    console.error('EquipoService error:', error);
    // Formato de error esperado del backend puede variar; aquí propagamos el mensaje
    const message = error?.error?.mensaje || error?.message || 'Error en la petición';
    return throwError(() => ({ message, original: error }));
  }

    desactivar(id: string) {
    return this.http.put(`${this.baseUrl}/equipos/${id}/desactivar`, {});
    }

}
