import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PeluqueroService {
  private apiUrl = `${environment.apiUrl}/peluqueros`;

  constructor(private http: HttpClient) {}

  obtenerPorUsuarioId(usuarioId: number): Observable<any> {
    const url = `${this.apiUrl}/usuario/${usuarioId}`;
    console.log('[PeluqueroService] GET ->', url);
    return this.http.get(url);
  }

  actualizarPeluquero(id: string, data: any): Observable<any> {
  console.log('[PeluqueroService] Actualizando peluquero ->', `${this.apiUrl}/${id}`, 'con data:', data);
  return this.http.put(`${this.apiUrl}/${id}`, data);
}


  actualizarPorUsuarioId(usuarioId: number, data: any): Observable<any> {
    const url = `${this.apiUrl}/por-usuario/${usuarioId}`;
    console.log('[PeluqueroService] PUT ->', url, 'Datos:', data);
    return this.http.put(url, data);
  }

  getBySede(sedeId: string): Observable<any[]> {
    const url = `${this.apiUrl}?sedeId=${sedeId}`;
    console.log('[PeluqueroService] GET ->', url);
    return this.http.get<any[]>(url);
  }

  obtenerPerfil() {
    return this.http.get<any>(`${this.apiUrl}/perfil`);
  }

  actualizarPerfil(payload: any) {
    return this.http.put<any>(`${this.apiUrl}/perfil`, payload);
  }
}
