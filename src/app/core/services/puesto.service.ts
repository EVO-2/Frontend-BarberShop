import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PuestoService {

  private baseUrl = 'http://localhost:3000/api/puestos'; 

  constructor(private http: HttpClient) {}

  /**
   * Obtener puestos disponibles (no ocupados) de una sede.
   * Si se proporciona peluqueroId (modo editar), su puesto actual no será excluido.
   * @param sedeId ID de la sede (obligatorio)
   * @param peluqueroId ID del peluquero (opcional en modo edición)
   */
 getPuestos(sedeId: string, peluqueroId?: string): Observable<any[]> {
  let params = new HttpParams().set('sede_id', sedeId);

  if (peluqueroId) {
    params = params.set('peluquero_id', peluqueroId);
  }

  console.log(
    '[PuestoService] GET puestos URL:',
    this.baseUrl,
    'params=',
    params.toString()
  );

  return this.http.get<any[]>(this.baseUrl, { params });
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
