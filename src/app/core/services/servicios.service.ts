import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError, tap } from 'rxjs';

export interface Servicio {
  _id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: string;
  imagenes?: string[];
  estado?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private apiUrl = 'http://192.168.1.7:3000/api/servicios'; // ⚡ IP LAN para móviles

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3500,
      panelClass: tipo === 'success' ? ['snackbar-success'] : ['snackbar-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private manejarError(error: HttpErrorResponse) {
    let mensaje = 'Ocurrió un error inesperado';
    if (error.error?.message) mensaje = error.error.message;
    else if (error.status === 0) mensaje = 'No se pudo conectar con el servidor';
    else if (error.status >= 500) mensaje = 'Error interno del servidor';
    this.mostrarMensaje(mensaje, 'error');
    return throwError(() => new Error(mensaje));
  }

  obtenerServicios(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params })
      .pipe(catchError(this.manejarError.bind(this)));
  }

  obtenerServicioPorId(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError.bind(this)));
  }

  crearServicio(data: FormData): Observable<{ mensaje: string; data: Servicio }> {
    return this.http.post<{ mensaje: string; data: Servicio }>(this.apiUrl, data).pipe(
      tap(resp => this.mostrarMensaje(resp.mensaje || 'Servicio creado exitosamente')),
      catchError(this.manejarError.bind(this))
    );
  }

  actualizarServicio(id: string, data: FormData | Servicio): Observable<{ mensaje: string; data: Servicio }> {
    return this.http.put<{ mensaje: string; data: Servicio }>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.mostrarMensaje('Servicio actualizado correctamente')),
      catchError(this.manejarError.bind(this))
    );
  }

  cambiarEstadoServicio(id: string | undefined, estado: boolean): Observable<any> {
    if (!id) return throwError(() => new Error('ID de servicio no proporcionado'));
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado }).pipe(
      tap(() => this.mostrarMensaje(`Servicio ${estado ? 'activado' : 'desactivado'} correctamente`)),
      catchError(this.manejarError.bind(this))
    );
  }

  toggleEstadoServicio(id: number, estadoActual: boolean): Observable<any> {
    const nuevoEstado = !estadoActual;
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado }).pipe(
      tap(() => this.mostrarMensaje(`Servicio ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`)),
      catchError(this.manejarError.bind(this))
    );
  }
}