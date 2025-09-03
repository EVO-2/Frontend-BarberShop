import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private sedesUrl = `${environment.apiUrl}/sedes`;
  private rolesUrl = `${environment.apiUrl}/roles`;
  private perfilUrl = `${this.apiUrl}/perfil`; 

  constructor(private http: HttpClient) {}

  // ===== Obtener TODOS los usuarios =====
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((res) => console.log('[UsuarioService] obtenerUsuarios =>', res))
    );
  }

  // ===== Obtener UN usuario por ID =====
  obtenerUsuarioPorId(id: string): Observable<any> {
    console.log('[UsuarioService] obtenerUsuarioPorId => ID:', id);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap((res) => console.log('[UsuarioService] obtenerUsuarioPorId respuesta:', res))
    );
  }

  // ===== Crear usuario =====
  crearUsuario(data: any): Observable<any> {
    console.log('[UsuarioService] crearUsuario => payload:', data);
    return this.http.post(this.apiUrl, data).pipe(
      tap((res) => console.log('[UsuarioService] crearUsuario respuesta:', res))
    );
  }

  // ===== Actualizar usuario =====
  actualizarUsuario(id: string, data: any): Observable<any> {
    console.log('[UsuarioService] actualizarUsuario => ID:', id, 'payload:', data);
    return this.http.put(`${this.apiUrl}/${id}`, data).pipe(
      tap((res) => console.log('[UsuarioService] actualizarUsuario respuesta:', res))
    );
  }

  // ===== Cambiar estado (activar/desactivar) usuario =====
  cambiarEstadoUsuario(id: string, nuevoEstado: boolean): Observable<any> {
    console.log('[UsuarioService] cambiarEstadoUsuario => ID:', id, 'nuevoEstado:', nuevoEstado);
    return this.http.patch(`${this.apiUrl}/actualizar-estado/${id}`, { estado: nuevoEstado }).pipe(
      tap((res) => console.log('[UsuarioService] cambiarEstadoUsuario respuesta:', res))
    );
  }

  // ===== Eliminar usuario =====
  eliminarUsuario(id: string): Observable<any> {
    console.log('[UsuarioService] eliminarUsuario => ID:', id);
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap((res) => console.log('[UsuarioService] eliminarUsuario respuesta:', res))
    );
  }

  // ===== Subir foto de perfil =====
  actualizarFoto(id: string, formData: FormData): Observable<any> {
    console.log('[UsuarioService] actualizarFoto => ID:', id, 'formData:', formData);
    return this.http.post(`${this.apiUrl}/${id}/foto`, formData).pipe(
      tap((res) => console.log('[UsuarioService] actualizarFoto respuesta:', res))
    );
  }

  // ===== Obtener Roles =====
  obtenerRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.rolesUrl).pipe(
      tap((res) => console.log('[UsuarioService] obtenerRoles =>', res))
    );
  }

  // ===== Obtener todas las Sedes =====
  obtenerSedes(): Observable<any[]> {
    return this.http.get<any[]>(this.sedesUrl).pipe(
      tap((res) => console.log('[UsuarioService] obtenerSedes =>', res))
    );
  }

  // ===== Obtener Puestos disponibles por Sede =====
  obtenerPuestosDisponibles(sedeId: string): Observable<any[]> {
    console.log('[UsuarioService] obtenerPuestosDisponibles => SedeID:', sedeId);
    return this.http.get<any[]>(`${this.sedesUrl}/${sedeId}/puestos`).pipe(
      tap((res) => console.log('[UsuarioService] obtenerPuestosDisponibles respuesta:', res))
    );
  }

  // ===== Cambiar contraseña =====
  cambiarPassword(id: string, data: { actual: string; nueva: string }): Observable<any> {
    console.log('[UsuarioService] cambiarPassword => ID:', id, 'data:', data);
    return this.http.put(`${this.apiUrl}/${id}/cambiar-password`, data).pipe(
      tap((res) => console.log('[UsuarioService] cambiarPassword respuesta:', res))
    );
  }

  // ===== Verificar si un puesto está disponible (o asignado al mismo usuario) =====
  verificarPuesto(puestoId: string, usuarioId?: string): Observable<boolean> {
    let params = new HttpParams();
    if (usuarioId) params = params.set('usuarioId', usuarioId);

    const url = `${this.apiUrl}/verificar-puesto/${puestoId}`;
    console.log('[UsuarioService] verificarPuesto => URL:', url, 'params=', params.toString());

    return this.http
      .get<{ disponible: boolean }>(url, { params })
      .pipe(
        tap((res) => console.log('[UsuarioService] verificarPuesto respuesta:', res)),
        map((res) => res.disponible)
      );
  }

  // ===== PERFIL UNIFICADO =====

  // Obtener perfil
  obtenerPerfil(): Observable<any> {
    console.log('[UsuarioService] obtenerPerfil => llamando endpoint:', this.perfilUrl);
    return this.http.get<any>(this.perfilUrl).pipe(
      tap((perfil) => console.log('[UsuarioService] Perfil obtenido:', perfil))
    );
  }

  // Actualizar perfil unificado
  actualizarPerfil(data: any, foto?: File): Observable<any> {
    console.log('[UsuarioService] actualizarPerfil => payload:', data, 'foto:', foto);
    
    if (foto) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          if (Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      formData.append('foto', foto);

      return this.http.put<any>(this.perfilUrl, formData).pipe(
        tap((res) => console.log('[UsuarioService] Perfil actualizado (con foto) respuesta:', res))
      );
    }

    return this.http.put<any>(this.perfilUrl, data).pipe(
      tap((res) => console.log('[UsuarioService] Perfil actualizado respuesta:', res))
    );
  }
}
