import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private sedesUrl = `${environment.apiUrl}/sedes`;
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ===== Obtener TODOS los usuarios =====
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // ===== Obtener UN usuario por ID =====
  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ===== Crear usuario =====
  crearUsuario(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // ===== Actualizar usuario =====
  actualizarUsuario(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // ===== Cambiar estado (activar/desactivar) usuario =====
  cambiarEstadoUsuario(id: string, nuevoEstado: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/actualizar-estado/${id}`, { estado: nuevoEstado });
  }

  // ===== Eliminar usuario =====
  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ===== Subir foto de perfil =====
  actualizarFoto(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/foto`, formData);
  }

  // ===== Obtener Roles =====
  obtenerRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/roles`);
  }

  // ===== Obtener todas las Sedes =====
  obtenerSedes(): Observable<any[]> {
    return this.http.get<any[]>(this.sedesUrl);
  }

  // ===== Obtener Puestos disponibles por Sede =====
  obtenerPuestosDisponibles(sedeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.sedesUrl}/${sedeId}/puestos`);
  }

  cambiarPassword(id: string, data: { actual: string; nueva: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cambiar-password`, data);
  }

  
  verificarPuestoOcupado(puestoId: string, usuarioId: string): Observable<boolean> {
      return this.http.get<boolean>(`${this.baseUrl}/usuarios/verificar-puesto/${puestoId}?usuarioId=${usuarioId}`);
    }
}
