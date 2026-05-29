import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuperadminService {
  private apiUrl = `${environment.apiUrl}/superadmin`;

  constructor(private http: HttpClient) { }

  obtenerStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  obtenerEmpresas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/empresas`);
  }

  actualizarSuscripcion(id: string, datos: { plan?: string; suscripcionEstado?: string; fechaFinPrueba?: string | null; fechaProximoCobro?: string | null }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/empresas/${id}/suscripcion`, datos);
  }

  toggleEstadoEmpresa(id: string, estado: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/empresas/${id}/estado`, { estado });
  }
}
