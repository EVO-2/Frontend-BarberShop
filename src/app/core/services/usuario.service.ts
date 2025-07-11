import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs'; // ✅ map importado correctamente

const BASE_URL = 'http://localhost:3000/api/usuarios';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<any> {
    return this.http.get(BASE_URL);
  }

  obtenerUsuario(id: string): Observable<any> {
    return this.http.get(`${BASE_URL}/${id}`);
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(BASE_URL, usuario);
  }

  actualizarUsuario(id: string, usuario: any): Observable<any> {
    return this.http.put(`${BASE_URL}/${id}`, usuario);
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${BASE_URL}/${id}`);
  }

  actualizarEstado(id: string, estado: boolean): Observable<any> {
    return this.http.patch(`${BASE_URL}/${id}/estado`, { estado });
  }

  verificarCorreoExiste(correo: string): Observable<boolean> {
    return this.http.get<{ existe: boolean }>(`${BASE_URL}/verificar-correo/${correo}`)
      .pipe(map(res => res.existe)); // ✅ map usado correctamente ahora
  }
}
