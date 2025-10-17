import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Peluquero } from 'src/app/shared/models/peluquero.model';

@Injectable({
  providedIn: 'root',
})
export class PeluqueroService {
  private apiUrl = `${environment.apiUrl}/peluqueros`;

  constructor(private http: HttpClient) {}

  /** 🔹 Obtener todos los peluqueros (activos o disponibles) */
  obtenerPeluqueros(): Observable<Peluquero[]> {
    return this.http.get<Peluquero[]>(this.apiUrl);
  }

  /** 🔹 Obtener solo peluqueros activos */
  obtenerPeluquerosActivos(): Observable<Peluquero[]> {
    return this.http.get<Peluquero[]>(`${this.apiUrl}?estado=true`);
  }

  /** 🔹 Obtener peluquero por ID de usuario */
  obtenerPorUsuarioId(usuarioId: number): Observable<any> {
    const url = `${this.apiUrl}/usuario/${usuarioId}`;
    console.log('[PeluqueroService] GET ->', url);
    return this.http.get(url);
  }

  /** 🔹 Actualizar peluquero por su ID */
  actualizarPeluquero(id: string, data: any): Observable<any> {
    console.log(
      '[PeluqueroService] Actualizando peluquero ->',
      `${this.apiUrl}/${id}`,
      'con data:',
      data
    );
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  /** 🔹 Actualizar peluquero por ID de usuario */
  actualizarPorUsuarioId(usuarioId: number, data: any): Observable<any> {
    const url = `${this.apiUrl}/por-usuario/${usuarioId}`;
    console.log('[PeluqueroService] PUT ->', url, 'Datos:', data);
    return this.http.put(url, data);
  }

  /** 🔹 Obtener peluqueros por sede */
  getBySede(sedeId: string): Observable<any[]> {
    const url = `${this.apiUrl}?sedeId=${sedeId}`;
    console.log('[PeluqueroService] GET ->', url);
    return this.http.get<any[]>(url);
  }

  /** 🔹 Obtener perfil del peluquero autenticado */
  obtenerPerfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/perfil`);
  }

  /** 🔹 Actualizar perfil del peluquero autenticado */
  actualizarPerfil(payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/perfil`, payload);
  }
}
