import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private readonly apiUrl = 'http://localhost:3000/api/clientes';

  constructor(private http: HttpClient) {}

  // 🔽 Obtener todos los clientes
  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // ➕ Crear cliente
  crearCliente(cliente: any): Observable<any> {
    return this.http.post(this.apiUrl, cliente);
  }

  // 🔄 Actualizar cliente (ej: datos básicos o estado)
  actualizarCliente(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  // ✅ Activar cliente
  activarCliente(id: number): Observable<any> {
    return this.actualizarCliente(id, { estado: true });
  }

  // ❌ Desactivar cliente
  desactivarCliente(id: number): Observable<any> {
    return this.actualizarCliente(id, { estado: false });
  }
}
