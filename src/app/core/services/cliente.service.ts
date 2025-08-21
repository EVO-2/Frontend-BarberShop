import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  // Obtener cliente por usuarioId
  obtenerPorUsuarioId(usuarioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  // Actualizar cliente por id
  actualizarCliente(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // Actualizar cliente por usuarioId
  actualizarPorUsuarioId(usuarioId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/por-usuario/${usuarioId}`, data);
  }
}
