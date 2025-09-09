import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PuestoService {

  private baseUrl = `${environment.apiUrl}/puestos`; 

  constructor(private http: HttpClient) {}

  /**
   * Obtener puestos disponibles de una sede.
   * Si se pasa usuarioId, también se incluye el puesto actual del peluquero.
   * @param sedeId ID de la sede (obligatorio)
   * @param usuarioId ID del usuario/peluquero en edición (opcional)
   */
  getPuestosPorSede(sedeId: string, usuarioId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (usuarioId) {
      // 👇 Enviamos como espera el backend
      params = params.set('usuario_id', usuarioId);
    }
    return this.http.get<any[]>(`${this.baseUrl}/por-sede/${sedeId}`, { params });
  }

  /**
   * Liberar un puesto de trabajo (remover peluquero asignado)
   * @param puestoId ID del puesto a liberar
   */
  liberarPuesto(puestoId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${puestoId}/liberar`, {});
  }

  /**
   * Asignar un peluquero a un puesto de trabajo
   * @param puestoId ID del puesto
   * @param peluqueroId ID del peluquero
   */
  asignarPeluquero(puestoId: string, peluqueroId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${puestoId}/asignar`, { peluqueroId });
  }

}
