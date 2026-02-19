import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpEvent,
  HttpRequest
} from '@angular/common/http';
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

// Interfaz para movimientos de equipo
export interface EquipoMovimiento {
  _id?: string;
  equipo: string;
  tipo: string;
  descripcion?: string;
  fechaInicio?: string | Date;
  toSede?: string;
  toPuesto?: string;
  responsable?: string;
  estado?: string;
  creadoPor?: any;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class EquipoService {

  private baseUrl = `${environment.apiUrl}/equipos`;

  constructor(private http: HttpClient) { }

  // =========================================
  // CRUD Equipos
  // =========================================
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
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http
      .get<PagedResponse<Equipo>>(this.baseUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  obtenerPorId(id: string): Observable<Equipo> {
    return this.http
      .get<{ data: Equipo }>(`${this.baseUrl}/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  crear(data: Partial<Equipo>): Observable<Equipo> {
    return this.http
      .post<{ data: Equipo }>(this.baseUrl, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  actualizar(id: string, data: Partial<Equipo>): Observable<Equipo> {
    return this.http
      .put<{ data: Equipo }>(`${this.baseUrl}/${id}`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  desactivar(id: string): Observable<Equipo> {
    return this.http
      .patch<{ data: Equipo }>(`${this.baseUrl}/${id}/desactivar`, {})
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  eliminar(id: string): Observable<{ mensaje?: string }> {
    return this.http
      .delete<{ mensaje?: string }>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  uploadImages(equipoId: string, files: FileList | File[]): Observable<HttpEvent<any>> {
    const form = new FormData();
    if (files) {
      const fileArray: File[] = files instanceof FileList ? Array.from(files) : files;
      fileArray.forEach(file => form.append('imagenes', file));
    }
    const req = new HttpRequest('POST', `${this.baseUrl}/${equipoId}/upload`, form, { reportProgress: true });
    return this.http.request(req).pipe(catchError(this.handleError));
  }

  // =========================================
  // Movimientos de equipo
  // =========================================
  listarMovimientos(equipoId: string): Observable<EquipoMovimiento[]> {
    return this.http
      .get<{ data: EquipoMovimiento[] }>(`${this.baseUrl}/${equipoId}/movimientos`)
      .pipe(map(res => res.data), catchError(this.handleError));
  }

  crearMovimiento(equipoId: string, movimiento: Partial<EquipoMovimiento>): Observable<EquipoMovimiento> {
    return this.http
      .post<{ data: EquipoMovimiento }>(`${this.baseUrl}/${equipoId}/movimientos`, movimiento)
      .pipe(map(res => res.data), catchError(this.handleError));
  }

  private handleError(error: any) {
    const message =
      error?.error?.mensaje ||
      error?.message ||
      'Error en la petición';
    return throwError(() => ({ message }));
  }
}
