import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Usuario {
  id?: number;
  nombre: string;
  correo: string;
  password?: string;
  rol: string;
  estado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Token no encontrado en localStorage');
    }

    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token ?? ''}`,
        'Content-Type': 'application/json'
      })
    };
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('❌ Error en la petición HTTP:', error);
    return throwError(() => error);
  }

  activarUsuario(id: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}/activar`, {}, this.getHeaders());
}

desactivarUsuario(id: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}/desactivar`, {}, this.getHeaders());
}

}

