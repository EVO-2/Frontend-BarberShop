// src/app/core/services/puesto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PuestoTrabajo } from 'src/app/shared/models/puesto-trabajo.model';
//import { Peluquero } from 'src/app/shared/models/peluquero.model';


@Injectable({
  providedIn: 'root'
})
export class PuestoService {

  private baseUrl = `${environment.apiUrl}/puestos`;

  constructor(private http: HttpClient) {}

  /** Obtener puestos disponibles de una sede */
  getPuestosPorSede(sedeId: string, usuarioId?: string): Observable<PuestoTrabajo[]> {
    let params = new HttpParams();
    if (usuarioId) params = params.set('usuario_id', usuarioId);
    return this.http.get<PuestoTrabajo[]>(`${this.baseUrl}/por-sede/${sedeId}`, { params });
  }

  /** Liberar un puesto de trabajo */
  liberarPuesto(puestoId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${puestoId}/liberar`, {});
  }

  /** Asignar un peluquero a un puesto de trabajo */
  asignarPeluquero(puestoId: string, peluqueroId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${puestoId}/asignar`, { peluqueroId });
  }

  /** Crear un nuevo puesto de trabajo */
  crearPuesto(puesto: PuestoTrabajo): Observable<PuestoTrabajo> {
    // Si tu backend espera { nombre, sedeId } podrías transformar aquí antes de enviar.
    // Ej: return this.http.post<PuestoTrabajo>(this.baseUrl, { nombre: puesto.nombre, sedeId: (puesto.sede as any)._id || puesto.sede });
    return this.http.post<PuestoTrabajo>(this.baseUrl, puesto);
  }

  /** Actualizar un puesto existente */
  actualizarPuesto(puestoId: string, puesto: Partial<PuestoTrabajo>): Observable<PuestoTrabajo> {
    return this.http.put<PuestoTrabajo>(`${this.baseUrl}/${puestoId}`, puesto);
  }

  /**
   * Cambiar estado (activar / desactivar) del puesto.
   * Usa PUT a /api/puestos/:id con body { estado } para ser coherente con tu controlador actualizarPuesto.
   */
  cambiarEstado(id: string, estado: boolean): Observable<PuestoTrabajo> {
    return this.http.put<PuestoTrabajo>(`${this.baseUrl}/${id}`, { estado });
  }

  /** Eliminar un puesto (si tu backend hace soft-delete con estado=false usa actualizarPuesto) */
  eliminarPuesto(puestoId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${puestoId}`);
  }

 
}
