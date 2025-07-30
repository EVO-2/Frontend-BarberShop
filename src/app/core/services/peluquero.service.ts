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
    return this.http.get(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  actualizarPeluquero(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  actualizarPorUsuarioId(usuarioId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/por-usuario/${usuarioId}`, data);
  }

}
