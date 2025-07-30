import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // ===== CRUD de Usuarios (para Admin) =====
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  actualizarUsuario(id: number | string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  cambiarEstadoUsuario(id: number | string, nuevoEstado: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado });
  }


  eliminarUsuario(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ===== Gestión de Foto de Perfil =====
  actualizarFoto(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/foto`, formData);
  }

  // ===== Actualización de Perfil Personal =====
  actualizarPerfil(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, formData);
  }

  // ===== Cambio de Contraseña =====
  cambiarPassword(id: number | string, data: { actual: string; nueva: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cambiar-password`, data);
  }

  // ===== Obtener Roles =====
  obtenerRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/roles`);
  }
}
