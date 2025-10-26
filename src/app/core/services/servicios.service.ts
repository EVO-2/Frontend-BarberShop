import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

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
  private apiUrl = `${environment.apiUrl}/servicios`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  // ✅ Mostrar mensajes de notificación
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3500,
      panelClass: tipo === 'success' ? ['snackbar-success'] : ['snackbar-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  // ✅ Manejo centralizado de errores HTTP
  private manejarError(error: HttpErrorResponse) {
    let mensaje = 'Ocurrió un error inesperado';
    if (error.error?.message) mensaje = error.error.message;
    else if (error.status === 0) mensaje = 'No se pudo conectar con el servidor';
    else if (error.status >= 500) mensaje = 'Error interno del servidor';
    this.mostrarMensaje(mensaje, 'error');
    return throwError(() => new Error(mensaje));
  }

  // ✅ Obtener lista de servicios (con o sin paginación)
  obtenerServicios(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params })
      .pipe(catchError(this.manejarError.bind(this)));
  }

  // ✅ Obtener un servicio por ID
  obtenerServicioPorId(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError.bind(this)));
  }

  // ✅ Crear nuevo servicio (respuesta con { mensaje, data })
  crearServicio(data: FormData): Observable<{ mensaje: string; data: Servicio }> {
    return this.http.post<{ mensaje: string; data: Servicio }>(this.apiUrl, data).pipe(
      tap((resp) => this.mostrarMensaje(resp.mensaje || 'Servicio creado exitosamente')),
      catchError(this.manejarError.bind(this))
    );
  }


 // ✅ Actualizar servicio
  actualizarServicio(id: string, data: FormData | Servicio): Observable<{ mensaje: string; data: Servicio }> {
    return this.http.put<{ mensaje: string; data: Servicio }>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.mostrarMensaje('Servicio actualizado correctamente')),
      catchError(this.manejarError.bind(this))
    );
  }


    // ✅ Cambiar estado (activar/desactivar)
    cambiarEstadoServicio(id: string | undefined, estado: boolean): Observable<any> {
    if (!id) {
        console.error('[cambiarEstadoServicio] Error: ID de servicio no proporcionado');
        return throwError(() => new Error('ID de servicio no proporcionado'));
    }

    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado }).pipe(
        tap(() => this.mostrarMensaje(`Servicio ${estado ? 'activado' : 'desactivado'} correctamente`)),
        catchError(this.manejarError.bind(this))
    );
    }



    // ✅ Desactivar o reactivar servicio (en lugar de eliminar)
    toggleEstadoServicio(id: number, estadoActual: boolean): Observable<any> {
    const nuevoEstado = !estadoActual;
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado }).pipe(
        tap(() => this.mostrarMensaje(`Servicio ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`)),
        catchError(this.manejarError.bind(this))
    );
    }
}
