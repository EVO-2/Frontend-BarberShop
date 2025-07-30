import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PuestoService {

  private baseUrl = 'http://localhost:3000/api/puestos'; // Ajusta si usas proxy o diferente puerto

  constructor(private http: HttpClient) {}

  /**
   * Obtener puestos activos (opcionalmente filtrados por sede)
   * @param sedeId ID de la sede (opcional)
   */
  getPuestos(sedeId?: string): Observable<any[]> {
    let params = new HttpParams();

    if (sedeId) {
      params = params.set('sede', sedeId); // ✅ usa 'sede' como en el backend
    }

    return this.http.get<any[]>(this.baseUrl, { params });
  }

  
}
